import { NextResponse } from "next/server";
import { z } from "zod";
import { databaseUnavailableResponse, hashPassword, normalizeEmail, serverErrorResponse } from "@/lib/auth/user";
import { getSql, isPostgresConfigured } from "@/lib/postgres/client";
import { enforceRateLimit, rejectOversizedRequest } from "@/lib/security/rate-limit";
import { createAuthToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/auth/messages";
import { recordSecurityEvent } from "@/lib/security/audit";
import { passwordSchema } from "@/lib/auth/password";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().email(),
  password: passwordSchema,
});

export async function POST(request: Request) {
  try {
    const sizeError = rejectOversizedRequest(request, 8_192);
    if (sizeError) return sizeError;
    const rateLimitError = enforceRateLimit(request, { namespace: "auth-register", limit: 5, windowMs: 60 * 60_000 });
    if (rateLimitError) return rateLimitError;
    if (!isPostgresConfigured()) return databaseUnavailableResponse();
    const emailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL && process.env.NEXT_PUBLIC_APP_URL);
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction && !emailConfigured) {
      return NextResponse.json({ error: "Account registration is temporarily unavailable." }, { status: 503 });
    }

    const input = registerSchema.parse(await request.json());
    const email = normalizeEmail(input.email);
    const sql = getSql();

    const [existing] = await sql<{ id: string }[]>`select id from app_users where email = ${email} limit 1`;
    if (existing) {
      return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
    }

    const [user] = await sql<{ id: string; email: string; name: string }[]>`
      insert into app_users (email, name, password_hash, email_verified_at)
      values (${email}, ${input.name}, ${hashPassword(input.password)}, ${emailConfigured ? null : new Date()})
      returning id, email, name
    `;

    if (emailConfigured) {
      const token = await createAuthToken(user.id, "email_verification", 24 * 60);
      await sendVerificationEmail(user.email, user.name, token);
    }
    await recordSecurityEvent({ event: "account_registered", userId: user.id, request });
    return NextResponse.json(
      {
        success: true,
        requiresVerification: emailConfigured,
        message: emailConfigured
          ? "Check your email to verify your account."
          : "Local preview account created. You can sign in now.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid registration data" }, { status: 400 });
    }
    return serverErrorResponse(error);
  }
}
