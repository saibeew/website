/* eslint-disable @typescript-eslint/no-require-imports */
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  const sql = postgres(connectionString);
  
  const migrationPath = path.join(__dirname, 'create_backtests_table.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log("Running migration from:", migrationPath);

  try {
    await sql.unsafe(migrationSQL);
    console.log("✅ Migration successful: Backtests table created.");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await sql.end();
  }
}

migrate();
