import { getSql } from "../../postgres/client";

export interface ScheduledPost {
  id: string;
  user_id: string;
  title: string;
  caption?: string;
  media_url?: string;
  platform: "telegram" | "tiktok" | "instagram" | "youtube" | "x";
  status: "draft" | "approved" | "published" | "rejected" | "archived";
  scheduled_at?: string;
  published_at?: string;
  reviewer_id?: string;
  review_note?: string;
  external_id?: string;
  created_at: string;
}

export async function createDraftPost(params: {
  userId: string;
  title: string;
  caption?: string;
  mediaUrl?: string;
  platform?: ScheduledPost["platform"];
  scheduledAt?: string;
}): Promise<ScheduledPost> {
  const sql = getSql();
  const [post] = await sql<ScheduledPost[]>`
    INSERT INTO scheduled_posts (user_id, title, caption, media_url, platform, scheduled_at, status)
    VALUES (
      ${params.userId}, 
      ${params.title}, 
      ${params.caption || null}, 
      ${params.mediaUrl || null}, 
      ${params.platform || "telegram"}, 
      ${params.scheduledAt || null}, 
      'draft'
    )
    RETURNING *
  `;
  return post;
}

export async function reviewPost(
  postId: string,
  status: "approved" | "rejected",
  reviewerId: string,
  note?: string
): Promise<ScheduledPost> {
  const sql = getSql();
  const [post] = await sql<ScheduledPost[]>`
    UPDATE scheduled_posts
    SET 
      status = ${status},
      reviewer_id = ${reviewerId},
      review_note = ${note || null},
      updated_at = NOW()
    WHERE id = ${postId} AND user_id = ${reviewerId}
    RETURNING *
  `;
  return post;
}

export async function getPendingReviews(): Promise<ScheduledPost[]> {
  const sql = getSql();
  return sql<ScheduledPost[]>`
    SELECT * FROM scheduled_posts
    WHERE status = 'draft'
    ORDER BY created_at DESC
  `;
}
export type { ScheduledPost as PostType };
