export type EnvironmentStatus = {
  valid: boolean;
  missing: string[];
  warnings: string[];
};

export function getEnvironmentStatus(env: NodeJS.ProcessEnv = process.env): EnvironmentStatus {
  const missing = ["DATABASE_URL", "NEXT_PUBLIC_APP_URL", "RESEND_API_KEY", "RESEND_FROM_EMAIL", "TRADING_WORKER_API_KEY"].filter((key) => !env[key]?.trim());
  const warnings: string[] = [];

  if (!env.OPENAI_API_KEY?.trim() && !env.GEMINI_API_KEY?.trim()) {
    missing.push("OPENAI_API_KEY or GEMINI_API_KEY");
  }
  if (!env.TELEGRAM_BOT_TOKEN?.trim() || !env.TELEGRAM_CHAT_ID?.trim()) {
    warnings.push("Telegram publishing is disabled.");
  }

  const sessionDays = Number(env.AUTH_SESSION_DAYS || 30);
  if (!Number.isFinite(sessionDays) || sessionDays < 1 || sessionDays > 30) {
    warnings.push("AUTH_SESSION_DAYS must be between 1 and 30; the application will clamp it.");
  }

  return { valid: missing.length === 0, missing, warnings };
}
