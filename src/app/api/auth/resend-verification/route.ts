import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeEmail, serverErrorResponse } from "@/lib/auth/user";
import { createAuthToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/auth/messages";
import { getSql } from "@/lib/postgres/client";
import { enforceRateLimit, rejectOversizedRequest } from "@/lib/security/rate-limit";

const schema = z.object({ email: z.string().email().max(320) });
const message = "If the account requires verification, a new email has been sent.";

export async function POST(request: Request) {
  try {
    const sizeError = rejectOversizedRequest(request, 4_096);
    if (sizeError) return sizeError;
    const limitError = enforceRateLimit(request, { namespace: "resend-verification", limit: 5, windowMs: 60 * 60_000 });
    if (limitError) return limitError;
    const input = schema.parse(await request.json());
    const [user] = await getSql()<{ id: string; email: string; name: string; email_verified_at: string | null }[]>`
      select id, email, coalesce(name, split_part(email, ${"@"}, 1)) as name, email_verified_at
      from app_users where lower(email) = ${normalizeEmail(input.email)} limit 1
    `;
    if (user && !user.email_verified_at) {
      const token = await createAuthToken(user.id, "email_verification", 24 * 60);
      await sendVerificationEmail(user.email, user.name, token);
    }
    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ message });
    return serverErrorResponse(error);
  }
}
