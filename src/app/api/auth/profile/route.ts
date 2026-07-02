import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, normalizeEmail, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";

export const dynamic = "force-dynamic";

const profileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().email().optional(),
});

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const input = profileSchema.parse(await request.json());
    const email = input.email ? normalizeEmail(input.email) : user.email;
    const name = input.name ?? user.name;

    const [updated] = await getSql()<{ id: string; email: string; name: string }[]>`
      update app_users
      set email = ${email}, name = ${name}, updated_at = now()
      where id = ${user.id}
      returning id, email, name
    `;

    return NextResponse.json({ user: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid profile data" }, { status: 400 });
    }
    return serverErrorResponse(error);
  }
}
