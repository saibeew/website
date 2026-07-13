import dotenv from "dotenv";
import { publishDuePosts } from "../src/lib/studio/publisher/scheduler";

dotenv.config({ path: ".env.local", override: true });

publishDuePosts()
  .then((count) => {
    console.log(`publishedCount=${count}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
