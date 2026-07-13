import { NextResponse } from "next/server";
import { getCurrentUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";
import { createDraftPost, reviewPost, publishDuePosts } from "@/lib/studio/publisher";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const sql = getSql();

    // Fetch all scheduled posts for this user
    const posts = await sql`
      SELECT * FROM scheduled_posts
      WHERE user_id = ${user.id}
      ORDER BY scheduled_at ASC, created_at DESC
    `;

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const body = await req.json().catch(() => ({}));
    const { title, caption, mediaUrl, platform, scheduledAt } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const post = await createDraftPost({
      userId: user.id,
      title,
      caption,
      mediaUrl,
      platform,
      scheduledAt,
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const body = await req.json().catch(() => ({}));
    const { action, postId, status, reviewNote } = body;

    // Trigger manual check for due posts
    if (action === "trigger_publish") {
      const publishedCount = await publishDuePosts();
      return NextResponse.json({ success: true, publishedCount });
    }

    if (!postId || !status) {
      return NextResponse.json({ success: false, error: "postId and status are required" }, { status: 400 });
    }

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 });
    }

    const post = await reviewPost(postId, status, user.id, reviewNote);
    let publishedCount = 0;

    if (
      status === "approved" &&
      (!post.scheduled_at || new Date(post.scheduled_at).getTime() <= Date.now())
    ) {
      publishedCount = await publishDuePosts();
    }

    return NextResponse.json({ success: true, post, publishedCount });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
