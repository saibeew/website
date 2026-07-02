import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, hashPassword, normalizeEmail, serverErrorResponse, setSessionCookie } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await request.json());
    const email = normalizeEmail(input.email);
    const sql = getSql();

    const [existing] = await sql<{ id: string }[]>`select id from app_users where email = ${email} limit 1`;
    if (existing) {
      return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
    }

    const [user] = await sql<{ id: string; email: string; name: string }[]>`
      insert into app_users (email, name, password_hash)
      values (${email}, ${input.name}, ${hashPassword(input.password)})
      returning id, email, name
    `;

    const { token, expiresAt } = await createSession(user.id, request);
    const response = NextResponse.json({ user }, { status: 201 });
    setSessionCookie(response, token, expiresAt);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid registration data" }, { status: 400 });
    }
    return serverErrorResponse(error);
  }
}
