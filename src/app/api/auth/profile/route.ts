import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, normalizeEmail, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";
import { createAuthToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/auth/messages";
import { recordSecurityEvent } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

const profileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().email().max(320).optional(),
});

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const input = profileSchema.parse(await request.json());
    const email = input.email ? normalizeEmail(input.email) : user.email;
    const name = input.name ?? user.name;
    const emailChanged = email !== user.email;

    if (emailChanged) {
      const [existing] = await getSql()`select id from app_users where lower(email) = ${email} and id <> ${user.id} limit 1`;
      if (existing) return NextResponse.json({ error: "Email address is already in use." }, { status: 409 });
      const token = await createAuthToken(user.id, "email_verification", 24 * 60);
      await sendVerificationEmail(email, name, token);
    }

    const sql = getSql();
    const [updated] = emailChanged
      ? await sql<{ id: string; email: string; name: string }[]>`
          update app_users set email = ${email}, name = ${name}, email_verified_at = null, updated_at = now()
          where id = ${user.id} returning id, email, name
        `
      : await sql<{ id: string; email: string; name: string }[]>`
          update app_users set name = ${name}, updated_at = now()
          where id = ${user.id} returning id, email, name
        `;

    await recordSecurityEvent({ event: emailChanged ? "profile_email_changed" : "profile_updated", userId: user.id, request });
    return NextResponse.json({ user: updated, emailVerificationRequired: emailChanged });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid profile data" }, { status: 400 });
    }
    return serverErrorResponse(error);
  }
}
