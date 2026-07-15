import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE_NAME, getCurrentUser, hashSessionToken, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";
import { recordSecurityEvent } from "@/lib/security/audit";

const deleteSchema = z.object({ sessionId: z.string().uuid() });

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    const cookieStore = await cookies();
    const currentHash = hashSessionToken(cookieStore.get(AUTH_COOKIE_NAME)?.value || "");
    const sessions = await getSql()`
      select id, user_agent, ip_address, created_at, expires_at, token_hash = ${currentHash} as current
      from user_sessions where user_id = ${user.id} and expires_at > now()
      order by created_at desc
    `;
    return NextResponse.json({ sessions });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    const input = deleteSchema.parse(await request.json());
    const [deleted] = await getSql()`
      delete from user_sessions where id = ${input.sessionId} and user_id = ${user.id}
      returning id
    `;
    if (!deleted) return NextResponse.json({ error: "Session not found." }, { status: 404 });
    await recordSecurityEvent({ event: "session_revoked", userId: user.id, request, metadata: { sessionId: input.sessionId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid session." }, { status: 400 });
    return serverErrorResponse(error);
  }
}
