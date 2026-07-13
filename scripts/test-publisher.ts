const dotenv = require("dotenv");
const path = require("path");

// Inject local config first
dotenv.config({ path: ".env.local" });

const { getSql } = require("../src/lib/postgres/client");
const { createDraftPost, reviewPost, publishDuePosts } = require("../src/lib/studio/publisher/index");

async function main() {
  console.log("=========================================");
  console.log("TESTING TIER 5: PUBLISHER & SCHEDULER");
  console.log("=========================================");

  const sql = getSql();

  try {
    // 1. Fetch or verify test user account exists
    const [user] = await sql`
      SELECT id FROM app_users LIMIT 1
    `;

    if (!user) {
      console.error("No users found in database to run publisher tests. Please seed user first.");
      process.exit(1);
    }

    console.log(`[Test] Using user ID: ${user.id}`);

    // Clean up any previous test scheduled posts to keep DB pristine
    await sql`
      DELETE FROM scheduled_posts 
      WHERE title LIKE '[Test Publisher]%'
    `;

    // 2. Create a draft post
    console.log("\n[Step 1] Creating draft post...");
    const draft = await createDraftPost({
      userId: user.id,
      title: "[Test Publisher] Institutional BTC Liquidity Update",
      caption: "Liquidity profiles expanding. Check risk tolerances and limits.",
      mediaUrl: "https://example.com/charts/btc_liquidity.png",
      platform: "telegram",
      scheduledAt: new Date(Date.now() - 5000).toISOString(), // scheduled 5s in past so it is due immediately
    });
    console.log(`- Created Draft: ID ${draft.id} | Status: ${draft.status} | Scheduled: ${draft.scheduled_at}`);

    // 3. Approve the post
    console.log("\n[Step 2] Reviewing and approving draft...");
    const approved = await reviewPost(draft.id, "approved", user.id, "Telemetry checked. Verified compliant.");
    console.log(`- Approved Post: Status: ${approved.status} | Note: ${approved.review_note}`);

    // 4. Trigger publishing of due posts
    console.log("\n[Step 3] Dispatching due posts scheduler...");
    const publishedCount = await publishDuePosts();
    console.log(`- Published Count: ${publishedCount}`);

    // 5. Verify database state
    const [finalPost] = await sql`
      SELECT status, external_id, published_at FROM scheduled_posts WHERE id = ${draft.id}
    `;
    console.log(`\n[Step 4] Verifying state in database:`);
    console.log(`- Post Status: ${finalPost.status}`);
    console.log(`- Message External ID: ${finalPost.external_id}`);
    console.log(`- Published Time: ${finalPost.published_at}`);

    // Clean up test post
    await sql`
      DELETE FROM scheduled_posts WHERE id = ${draft.id}
    `;
    console.log("\nTest post cleaned up successfully.");

  } catch (error) {
    console.error("Publisher test failed:", error);
  } finally {
    await sql.end();
  }
}

main().catch(console.error);
export {};
