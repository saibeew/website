import { NextResponse } from "next/server";
import { getCurrentUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth/user";
import { listStudioJobs } from "@/lib/studio/jobs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") || 25), 50);
    const jobs = await listStudioJobs(user.id, Number.isFinite(limit) ? limit : 25);

    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
