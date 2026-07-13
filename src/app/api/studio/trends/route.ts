import { NextResponse } from "next/server";
import { getCurrentUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth/user";
import { getTrendingTopics } from "@/lib/studio/trends";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const trends = await getTrendingTopics();
    return NextResponse.json({ success: true, trends });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
