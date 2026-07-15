import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, databaseUnavailableResponse, normalizeEmail, serverErrorResponse, setSessionCookie, verifyPassword } from "@/lib/auth/user";
import { getSql, isPostgresConfigured } from "@/lib/postgres/client";
import { enforceRateLimit, rejectOversizedRequest } from "@/lib/security/rate-limit";
import { recordSecurityEvent } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  try {
    const sizeError = rejectOversizedRequest(request, 8_192);
    if (sizeError) return sizeError;
    const rateLimitError = enforceRateLimit(request, { namespace: "auth-login", limit: 10, windowMs: 15 * 60_000 });
    if (rateLimitError) return rateLimitError;
    if (!isPostgresConfigured()) return databaseUnavailableResponse();

    const input = loginSchema.parse(await request.json());
    const email = normalizeEmail(input.email);

    const [row] = await getSql()<{ id: string; email: string; name: string; password_hash: string; email_verified_at: string | null }[]>`
      select id, email, coalesce(name, split_part(email, ${"@"}, 1)) as name, password_hash, email_verified_at
      from app_users
      where email = ${email}
      limit 1
    `;

    if (!row || !verifyPassword(input.password, row.password_hash)) {
      await recordSecurityEvent({ event: "login_failed", userId: row?.id, request });
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    if (!row.email_verified_at) {
      await recordSecurityEvent({ event: "login_blocked_unverified", userId: row.id, request });
      return NextResponse.json({ error: "Verify your email address before signing in." }, { status: 403 });
    }

    const { token, expiresAt } = await createSession(row.id, request);
    const response = NextResponse.json({ user: { id: row.id, email: row.email, name: row.name } });
    setSessionCookie(response, token, expiresAt);
    await recordSecurityEvent({ event: "login_succeeded", userId: row.id, request });
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
    }
    return serverErrorResponse(error);
  }
}
