import cron from "node-cron";
import { getSql } from "../../postgres/client";
import { publishToTelegram } from "./telegram";

let cronJob: ReturnType<typeof cron.schedule> | null = null;

export async function publishDuePosts(userId?: string): Promise<number> {
  const sql = getSql();

  try {
    // 1. Fetch approved posts where scheduled_at is in the past
    const duePosts = userId
      ? await sql`
          SELECT id, title, caption, media_url, platform
          FROM scheduled_posts
          WHERE user_id = ${userId}
            AND status = 'approved'
            AND (scheduled_at IS NULL OR scheduled_at <= NOW())
        `
      : await sql`
          SELECT id, title, caption, media_url, platform
          FROM scheduled_posts
          WHERE status = 'approved' AND (scheduled_at IS NULL OR scheduled_at <= NOW())
        `;

    if (duePosts.length === 0) return 0;

    console.log(`[Publisher] Processing ${duePosts.length} due posts...`);

    let processedCount = 0;
    for (const post of duePosts) {
      console.log(`[Publisher] Publishing post: ${post.title}`);
      
      let publishRes: { success: boolean; externalId?: string; error?: string } = { success: false, error: "Unsupported platform" };
      
      if (post.platform === "telegram") {
        publishRes = await publishToTelegram({
          mediaUrl: post.media_url || undefined,
          caption: post.caption || post.title,
        });
      }

      if (publishRes.success) {
        await sql`
          UPDATE scheduled_posts
          SET 
            status = 'published',
            external_id = ${publishRes.externalId ?? null},
            published_at = NOW(),
            updated_at = NOW()
          WHERE id = ${post.id}
        `;
        processedCount++;
      } else {
        await sql`
          UPDATE scheduled_posts
          SET 
            status = 'draft', -- revert to draft on failure
            review_note = ${`Publish failed: ${publishRes.error}`},
            updated_at = NOW()
          WHERE id = ${post.id}
        `;
      }
    }

    return processedCount;
  } catch (error) {
    console.error("[Publisher] Error running due posts publisher:", error);
    return 0;
  }
}

export function startScheduler() {
  if (cronJob) return;

  console.log("[Publisher] Initializing cron job scheduler (runs every minute)...");
  
  // Run check every minute
  cronJob = cron.schedule("* * * * *", async () => {
    try {
      const count = await publishDuePosts();
      if (count > 0) {
        console.log(`[Publisher] Scheduler processed ${count} posts.`);
      }
    } catch (err) {
      console.error("[Publisher] Cron job exception:", err);
    }
  });
}

export function stopScheduler() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log("[Publisher] Cron job scheduler stopped.");
  }
}
