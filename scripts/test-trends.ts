const { getTrendingTopics } = require("../src/lib/studio/trends/index");

async function main() {
  console.log("=========================================");
  console.log("TESTING TIER 3: TREND RADAR");
  console.log("=========================================");

  const trends = await getTrendingTopics();
  console.log(`Fetched ${trends.length} trending items.`);
  
  if (trends.length > 0) {
    console.log("\nTop 5 Scored Trends:");
    trends.slice(0, 5).forEach((trend: any, i: number) => {
      console.log(`\n[${i + 1}] Title: ${trend.title}`);
      console.log(`    Source: ${trend.source} | Category: ${trend.category}`);
      console.log(`    Score: ${trend.score} | Tags: ${trend.tags.join(", ")}`);
      console.log(`    Link: ${trend.link}`);
    });
  } else {
    console.log("No trends fetched.");
  }
}

main().catch(console.error);
export {};
