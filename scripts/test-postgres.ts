import postgres from "postgres";
import dotenv from "dotenv";

// Load env variables from the current working directory
dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;
console.log("Database URL from .env.local:", databaseUrl ? databaseUrl.replace(/:[^@]+@/, ":****@") : "undefined");

if (!databaseUrl) {
  console.error("DATABASE_URL is missing!");
  process.exit(1);
}

const sql = postgres(databaseUrl, {
  connect_timeout: 5,
});

async function main() {
  try {
    console.log("Attempting to connect to PostgreSQL...");
    const versionResult = await sql`select version()`;
    console.log("PostgreSQL Version:", versionResult[0].version);

    console.log("Checking if 'app_users' table exists...");
    const tableCheck = await sql<{ exists: boolean }[]>`
      select exists (
        select from information_schema.tables 
        where table_schema = 'public' 
        and table_name = 'app_users'
      )
    `;
    console.log("'app_users' table exists:", tableCheck[0].exists);

    if (!tableCheck[0].exists) {
      console.log("Table 'app_users' does NOT exist. Schema might not be initialized.");
    } else {
      const userCount = await sql`select count(*) from app_users`;
      console.log("Number of users in database:", userCount[0].count);

      const users = await sql`select id, email, name, password_hash from app_users`;
      console.log("Registered Users:", users);
    }
  } catch (err) {
    console.error("Database connection/query failed:", err);
  } finally {
    await sql.end();
  }
}

main();
