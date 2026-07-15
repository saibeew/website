import { NextResponse } from "next/server";
import { consumeAuthToken } from "@/lib/auth/tokens";
import { getSql } from "@/lib/postgres/client";
import { recordSecurityEvent } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  if (!token || token.length > 256) return NextResponse.redirect(`${appUrl}/login?verification=invalid`);

  const userId = await consumeAuthToken(token, "email_verification");
  if (!userId) return NextResponse.redirect(`${appUrl}/login?verification=invalid`);

  await getSql()`update app_users set email_verified_at = now(), updated_at = now() where id = ${userId}`;
  await recordSecurityEvent({ event: "email_verified", userId, request });
  return NextResponse.redirect(`${appUrl}/login?verification=success`);
}
