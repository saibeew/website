import { NextResponse } from "next/server";
import { z } from "zod";
import { clearSessionCookie, getCurrentUser, serverErrorResponse, unauthorizedResponse, verifyPassword } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";
import { recordSecurityEvent } from "@/lib/security/audit";
import { enforceRateLimit, rejectOversizedRequest } from "@/lib/security/rate-limit";

const schema = z.object({ password: z.string().min(1).max(128), confirmation: z.literal("DELETE") });

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    const sizeError = rejectOversizedRequest(request, 8_192);
    if (sizeError) return sizeError;
    const limitError = enforceRateLimit(request, { namespace: "delete-account", key: user.id, limit: 5, windowMs: 60 * 60_000 });
    if (limitError) return limitError;
    const input = schema.parse(await request.json());
    const [account] = await getSql()<{ password_hash: string; email: string }[]>`select password_hash, email from app_users where id = ${user.id}`;
    if (!account || !verifyPassword(input.password, account.password_hash)) {
      return NextResponse.json({ error: "Password is incorrect." }, { status: 403 });
    }

    await recordSecurityEvent({ event: "account_deleted", userId: user.id, request });
    const sql = getSql();
    await sql.begin(async (transaction) => {
      await transaction`delete from market_reports where author_id = ${user.id}`;
      await transaction`delete from beta_applications where lower(email) = ${account.email.toLowerCase()}`;
      await transaction`update security_audit_events set ip_address = null, user_agent = null, metadata = '{}'::jsonb where user_id = ${user.id}`;
      await transaction`delete from app_users where id = ${user.id}`;
    });
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Password and DELETE confirmation are required." }, { status: 400 });
    return serverErrorResponse(error);
  }
}
