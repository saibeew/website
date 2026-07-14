import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSql, isPostgresConfigured } from "@/lib/postgres/client";

export const AUTH_COOKIE_NAME = "beew_session";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

const sessionTtlDays = Number(process.env.AUTH_SESSION_DAYS || 30);

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return "scrypt$" + salt + "$" + hash;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionExpiry() {
  return new Date(Date.now() + sessionTtlDays * 24 * 60 * 60 * 1000);
}

export async function createSession(userId: string, request?: Request) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = sessionExpiry();
  const sql = getSql();

  await sql`
    insert into user_sessions (user_id, token_hash, user_agent, ip_address, expires_at)
    values (
      ${userId},
      ${hashSessionToken(token)},
      ${request?.headers.get("user-agent") || null},
      ${request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null},
      ${expiresAt}
    )
  `;

  return { token, expiresAt };
}

export async function getUserFromSessionToken(token?: string | null): Promise<AuthUser | null> {
  if (!token) return null;
  if (!isPostgresConfigured()) return null;

  const sql = getSql();
  const [user] = await sql<AuthUser[]>`
    select u.id, u.email, coalesce(u.name, split_part(u.email, ${"@"}, 1)) as name
    from app_users u
    inner join user_sessions s on s.user_id = u.id
    where s.token_hash = ${hashSessionToken(token)}
      and s.expires_at > now()
    limit 1
  `;

  return user || null;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  return getUserFromSessionToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}

export async function deleteSession(token?: string | null) {
  if (!token) return;
  if (!isPostgresConfigured()) return;
  await getSql()`delete from user_sessions where token_hash = ${hashSessionToken(token)}`;
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function serverErrorResponse(error: unknown) {
  if (isDatabaseConnectionError(error)) {
    return databaseUnavailableResponse();
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  return NextResponse.json({ error: message }, { status: 500 });
}

export function databaseUnavailableResponse() {
  return NextResponse.json(
    {
      error: "Database is not configured for this deployment. Add DATABASE_URL in the hosting environment variables and redeploy.",
    },
    { status: 503 }
  );
}

export function isDatabaseConnectionError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const code = (error as Error & { code?: string }).code;
  return (
    code === "28P01" ||
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    /password authentication failed|database .* does not exist|connect ECONNREFUSED|DATABASE_URL/i.test(error.message)
  );
}
