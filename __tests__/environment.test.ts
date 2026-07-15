import { getEnvironmentStatus } from "@/lib/environment";

describe("production environment validation", () => {
  it("reports required services when configuration is incomplete", () => {
    const status = getEnvironmentStatus({} as NodeJS.ProcessEnv);

    expect(status.valid).toBe(false);
    expect(status.missing).toEqual([
      "DATABASE_URL",
      "NEXT_PUBLIC_APP_URL",
      "RESEND_API_KEY",
      "RESEND_FROM_EMAIL",
      "TRADING_WORKER_API_KEY",
      "OPENAI_API_KEY or GEMINI_API_KEY",
    ]);
  });

  it("accepts the minimum production configuration", () => {
    const status = getEnvironmentStatus({
      DATABASE_URL: "postgres://example",
      NEXT_PUBLIC_APP_URL: "https://beew.ai",
      GEMINI_API_KEY: "configured",
      RESEND_API_KEY: "configured",
      RESEND_FROM_EMAIL: "beew.ai <support@beew.ai>",
      TRADING_WORKER_API_KEY: "a-secure-worker-key-with-at-least-32-characters",
      AUTH_SESSION_DAYS: "7",
    } as NodeJS.ProcessEnv);

    expect(status.valid).toBe(true);
    expect(status.missing).toEqual([]);
  });
});
