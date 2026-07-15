import { createHash, randomBytes } from "crypto";
import { getSql } from "@/lib/postgres/client";

export type AuthTokenPurpose = "email_verification" | "password_reset";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAuthToken(userId: string, purpose: AuthTokenPurpose, ttlMinutes: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
  const sql = getSql();

  await sql.begin(async (transaction) => {
    await transaction`
      update auth_tokens set used_at = now()
      where user_id = ${userId} and purpose = ${purpose} and used_at is null
    `;
    await transaction`
      insert into auth_tokens (user_id, purpose, token_hash, expires_at)
      values (${userId}, ${purpose}, ${hashToken(token)}, ${expiresAt})
    `;
  });

  return token;
}

export async function consumeAuthToken(token: string, purpose: AuthTokenPurpose) {
  const [consumed] = await getSql()<{ user_id: string }[]>`
    update auth_tokens
    set used_at = now()
    where token_hash = ${hashToken(token)}
      and purpose = ${purpose}
      and used_at is null
      and expires_at > now()
    returning user_id
  `;
  return consumed?.user_id || null;
}
