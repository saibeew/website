import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeEmail, serverErrorResponse } from "@/lib/auth/user";
import { createAuthToken } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/auth/messages";
import { getSql } from "@/lib/postgres/client";
import { enforceRateLimit, rejectOversizedRequest } from "@/lib/security/rate-limit";
import { recordSecurityEvent } from "@/lib/security/audit";

const schema = z.object({ email: z.string().email().max(320) });
const genericMessage = "If an account exists, a password-reset email has been sent.";

export async function POST(request: Request) {
  try {
    const sizeError = rejectOversizedRequest(request, 4_096);
    if (sizeError) return sizeError;
    const limitError = enforceRateLimit(request, { namespace: "forgot-password", limit: 5, windowMs: 60 * 60_000 });
    if (limitError) return limitError;

    const input = schema.parse(await request.json());
    const [user] = await getSql()<{ id: string; email: string; name: string }[]>`
      select id, email, coalesce(name, split_part(email, ${"@"}, 1)) as name
      from app_users where lower(email) = ${normalizeEmail(input.email)} limit 1
    `;
    if (user) {
      const token = await createAuthToken(user.id, "password_reset", 30);
      await sendPasswordResetEmail(user.email, user.name, token);
      await recordSecurityEvent({ event: "password_reset_requested", userId: user.id, request });
    }
    return NextResponse.json({ message: genericMessage });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ message: genericMessage });
    return serverErrorResponse(error);
  }
}
