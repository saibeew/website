import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeAuthToken } from "@/lib/auth/tokens";
import { hashPassword, serverErrorResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";
import { enforceRateLimit, rejectOversizedRequest } from "@/lib/security/rate-limit";
import { recordSecurityEvent } from "@/lib/security/audit";
import { passwordSchema } from "@/lib/auth/password";

const schema = z.object({ token: z.string().min(32).max(256), password: passwordSchema });

export async function POST(request: Request) {
  try {
    const sizeError = rejectOversizedRequest(request, 8_192);
    if (sizeError) return sizeError;
    const limitError = enforceRateLimit(request, { namespace: "reset-password", limit: 10, windowMs: 60 * 60_000 });
    if (limitError) return limitError;
    const input = schema.parse(await request.json());
    const userId = await consumeAuthToken(input.token, "password_reset");
    if (!userId) return NextResponse.json({ error: "Reset link is invalid or expired." }, { status: 400 });

    const sql = getSql();
    await sql.begin(async (transaction) => {
      await transaction`update app_users set password_hash = ${hashPassword(input.password)}, updated_at = now() where id = ${userId}`;
      await transaction`delete from user_sessions where user_id = ${userId}`;
    });
    await recordSecurityEvent({ event: "password_reset_completed", userId, request });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Password does not meet security requirements." }, { status: 400 });
    return serverErrorResponse(error);
  }
}
