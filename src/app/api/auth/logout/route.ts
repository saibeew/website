import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, clearSessionCookie, deleteSession, getCurrentUser, serverErrorResponse } from "@/lib/auth/user";
import { recordSecurityEvent } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const cookieStore = await cookies();
    await deleteSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);
    if (user) await recordSecurityEvent({ event: "logout", userId: user.id, request });
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    return serverErrorResponse(error);
  }
}
