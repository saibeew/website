import postgres from "postgres";

type PostgresClient = ReturnType<typeof postgres>;

declare global {
  // eslint-disable-next-line no-var
  var __beewPostgresSql: PostgresClient | undefined;
}

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured. Add it to .env.local before using PostgreSQL-backed data APIs.");
  }

  if (!globalThis.__beewPostgresSql) {
    globalThis.__beewPostgresSql = postgres(databaseUrl, {
      max: Number(process.env.POSTGRES_POOL_MAX || 10),
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: process.env.POSTGRES_SSL === "true" ? "require" : undefined,
    });
  }

  return globalThis.__beewPostgresSql;
}
