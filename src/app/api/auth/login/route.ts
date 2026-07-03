import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, databaseUnavailableResponse, normalizeEmail, serverErrorResponse, setSessionCookie, verifyPassword } from "@/lib/auth/user";
import { getSql, isPostgresConfigured } from "@/lib/postgres/client";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    if (!isPostgresConfigured()) return databaseUnavailableResponse();

    const input = loginSchema.parse(await request.json());
    const email = normalizeEmail(input.email);

    const [row] = await getSql()<{ id: string; email: string; name: string; password_hash: string }[]>`
      select id, email, coalesce(name, split_part(email, ${"@"}, 1)) as name, password_hash
      from app_users
      where email = ${email}
      limit 1
    `;

    if (!row || !verifyPassword(input.password, row.password_hash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const { token, expiresAt } = await createSession(row.id, request);
    const response = NextResponse.json({ user: { id: row.id, email: row.email, name: row.name } });
    setSessionCookie(response, token, expiresAt);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
    }
    return serverErrorResponse(error);
  }
}
