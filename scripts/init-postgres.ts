import postgres from "postgres";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required.");

  const sql = postgres(databaseUrl, {
    connect_timeout: 10,
    ssl: process.env.POSTGRES_SSL === "true" ? "require" : undefined,
  });

  try {
    const schemaPath = path.resolve("src/lib/postgres/schema.sql");
    await sql.unsafe(fs.readFileSync(schemaPath, "utf8"));

    const migrationsDir = path.resolve("src/lib/postgres/migrations");
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter((name) => name.endsWith(".sql"))
      .sort();

    for (const name of migrationFiles) {
      const [existing] = await sql`select name from schema_migrations where name = ${name}`;
      if (existing) continue;

      const migration = fs.readFileSync(path.join(migrationsDir, name), "utf8");
      await sql.begin(async (transaction) => {
        await transaction.unsafe(migration);
        await transaction`insert into schema_migrations (name) values (${name})`;
      });
      console.log(`Applied migration ${name}`);
    }

    console.log("Database schema is current.");
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error("Database initialization failed:", error);
  process.exit(1);
});
