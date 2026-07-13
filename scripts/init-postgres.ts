import postgres from "postgres";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { scryptSync, randomBytes } from "crypto";

// Load env variables
dotenv.config({ path: ".env.local" });

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return "scrypt$" + salt + "$" + hash;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is missing in .env.local!");
    process.exit(1);
  }

  // Parse connection URL to connect to the default "postgres" db first
  const defaultDbUrl = databaseUrl.replace(/\/([^/]+)$/, "/postgres");
  console.log("Connecting to default DB to ensure 'aialgo' database exists...");

  const sslOption = process.env.POSTGRES_SSL === "true" ? "require" : undefined;
  const sqlDefault = postgres(defaultDbUrl, { connect_timeout: 5, ssl: sslOption });

  try {
    // Check if aialgo database exists
    const dbCheck = await sqlDefault`
      SELECT 1 FROM pg_database WHERE datname = 'aialgo'
    `;

    if (dbCheck.length === 0) {
      console.log("Database 'aialgo' does not exist. Creating database...");
      // CREATE DATABASE cannot run inside a transaction block, so we run it directly
      await sqlDefault`CREATE DATABASE aialgo`;
      console.log("Database 'aialgo' created successfully.");
    } else {
      console.log("Database 'aialgo' already exists.");
    }
  } catch (err) {
    console.error("Failed to check/create database 'aialgo':", err);
    process.exit(1);
  } finally {
    await sqlDefault.end();
  }

  console.log("Connecting to 'aialgo' database to initialize schema...");
  const sql = postgres(databaseUrl, { connect_timeout: 5, ssl: sslOption });

  try {
    const schemaPath = path.resolve("src/lib/postgres/schema.sql");
    if (!fs.existsSync(schemaPath)) {
      console.error(`Schema file not found at: ${schemaPath}`);
      process.exit(1);
    }

    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    console.log("Running schema.sql...");
    
    // postgres package supports running raw queries. Since schema.sql contains multiple statements,
    // we can pass it directly or split it if necessary. Let's run it as unsafe raw query.
    await sql.unsafe(schemaSql);
    console.log("Schema initialized successfully.");

    // Seed default user if not exists
    const defaultEmail = "trader@beew.ai";
    const defaultName = "BEEW Trader";
    const defaultPassword = "Trade@2025";
    
    const [existingUser] = await sql`
      SELECT id FROM app_users WHERE email = ${defaultEmail} LIMIT 1
    `;

    if (!existingUser) {
      console.log(`Seeding default user: ${defaultEmail}...`);
      const passwordHash = hashPassword(defaultPassword);
      await sql`
        INSERT INTO app_users (email, name, password_hash)
        VALUES (${defaultEmail}, ${defaultName}, ${passwordHash})
      `;
      console.log("Default user seeded successfully.");
    } else {
      console.log(`Default user ${defaultEmail} already exists in database.`);
    }

  } catch (err) {
    console.error("Failed to run schema / seed data:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
