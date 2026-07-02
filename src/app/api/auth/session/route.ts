import { NextResponse } from "next/server";
import { getCurrentUser, serverErrorResponse } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
