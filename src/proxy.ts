import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "beew_session";

export function proxy(request: NextRequest) {
  const hasSessionCookie = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/dashboard") && !hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
