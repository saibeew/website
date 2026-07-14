import { NextResponse } from "next/server";
import fs from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { getCurrentUser, isDatabaseConnectionError, unauthorizedResponse, serverErrorResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";
import { createDraftPost, reviewPost, publishDuePosts } from "@/lib/studio/publisher";

export const dynamic = "force-dynamic";

type LocalPost = {
  id: string;
  user_id: string;
  title: string;
  caption: string;
  media_url?: string;
  platform: string;
  status: "draft" | "approved" | "published" | "rejected" | "archived";
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
  reviewer_id?: string;
  review_note?: string;
};

const LOCAL_POSTS_PATH = path.join(os.tmpdir(), "beew-studio", "local-publisher-posts.json");
const LOCAL_USER_ID = "local-db-unavailable";

function readLocalPosts(): LocalPost[] {
  if (!fs.existsSync(LOCAL_POSTS_PATH)) return [];
  return JSON.parse(fs.readFileSync(LOCAL_POSTS_PATH, "utf-8")) as LocalPost[];
}

function writeLocalPosts(posts: LocalPost[]) {
  fs.mkdirSync(path.dirname(LOCAL_POSTS_PATH), { recursive: true });
  fs.writeFileSync(LOCAL_POSTS_PATH, JSON.stringify(posts, null, 2), "utf-8");
}

async function getUserOrLocal() {
  try {
    const user = await getCurrentUser();
    return { user, localMode: user?.id === LOCAL_USER_ID };
  } catch (error) {
    if (!isDatabaseConnectionError(error)) throw error;
    return { user: { id: LOCAL_USER_ID, email: "trader@beew.ai", name: "BEEW Trader" }, localMode: true };
  }
}

export async function GET() {
  try {
    const { user, localMode } = await getUserOrLocal();
    if (!user) return unauthorizedResponse();

    if (localMode) {
      return NextResponse.json({ success: true, posts: readLocalPosts().sort((a, b) => b.created_at.localeCompare(a.created_at)) });
    }

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
    const { user, localMode } = await getUserOrLocal();
    if (!user) return unauthorizedResponse();

    const body = await req.json().catch(() => ({}));
    const { title, caption, mediaUrl, platform, scheduledAt } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    if (localMode) {
      const now = new Date().toISOString();
      const post: LocalPost = {
        id: randomUUID(),
        user_id: user.id,
        title,
        caption: caption || "",
        media_url: mediaUrl,
        platform: platform || "telegram",
        status: "draft",
        scheduled_at: scheduledAt,
        created_at: now,
        updated_at: now,
      };
      writeLocalPosts([post, ...readLocalPosts()]);
      return NextResponse.json({ success: true, post, localMode: true });
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
    const { user, localMode } = await getUserOrLocal();
    if (!user) return unauthorizedResponse();

    const body = await req.json().catch(() => ({}));
    const { action, postId, status, reviewNote } = body;

    // Trigger manual check for due posts
    if (action === "trigger_publish") {
      if (localMode) {
        return NextResponse.json({ success: true, publishedCount: 0, localMode: true });
      }
      const publishedCount = await publishDuePosts();
      return NextResponse.json({ success: true, publishedCount });
    }

    if (!postId || !status) {
      return NextResponse.json({ success: false, error: "postId and status are required" }, { status: 400 });
    }

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 });
    }

    if (localMode) {
      const posts = readLocalPosts();
      const post = posts.find((item) => item.id === postId);
      if (!post) return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
      post.status = status;
      post.reviewer_id = user.id;
      post.review_note = reviewNote;
      post.updated_at = new Date().toISOString();
      writeLocalPosts(posts);
      return NextResponse.json({ success: true, post, publishedCount: 0, localMode: true });
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
