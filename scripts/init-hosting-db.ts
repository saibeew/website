import postgres from "postgres";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is missing in .env.local.");
    process.exit(1);
  }

  const sql = postgres(databaseUrl, {
    connect_timeout: 10,
    ssl: process.env.POSTGRES_SSL === "true" ? "require" : undefined,
  });

  try {
    const schemaPath = path.resolve("src/lib/postgres/schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");

    console.log("Connecting to PostgreSQL...");
    await sql`select 1`;

    console.log("Running schema.sql...");
    await sql.unsafe(schemaSql);

    const tableCheck = await sql<{ table_name: string }[]>`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name in (
          'app_users',
          'user_sessions',
          'strategies',
          'watchlists',
          'trades',
          'exchange_connections',
          'market_reports',
          'backtests',
          'deployments',
          'beta_applications'
        )
      order by table_name
    `;

    console.log("Schema initialized. Tables found:", tableCheck.map((row) => row.table_name).join(", "));
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error("Database initialization failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
