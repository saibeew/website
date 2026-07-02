import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, clearSessionCookie, deleteSession, serverErrorResponse } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const cookieStore = await cookies();
    await deleteSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    return serverErrorResponse(error);
  }
}
