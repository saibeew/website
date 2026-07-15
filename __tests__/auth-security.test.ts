jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("next/server", () => ({ NextResponse: { json: jest.fn() } }));

import { cookies } from "next/headers";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth/user";

const mockedCookies = cookies as jest.MockedFunction<typeof cookies>;

describe("authentication security", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
    jest.resetAllMocks();
  });

  it("does not accept the former demo session token", async () => {
    delete process.env.DATABASE_URL;
    mockedCookies.mockResolvedValue({
      get: () => ({ name: "beew_session", value: "demo-session-token" }),
    } as Awaited<ReturnType<typeof cookies>>);

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("hashes passwords with a unique salt and verifies them safely", () => {
    const first = hashPassword("Correct-Horse-7");
    const second = hashPassword("Correct-Horse-7");

    expect(first).not.toBe(second);
    expect(verifyPassword("Correct-Horse-7", first)).toBe(true);
    expect(verifyPassword("wrong", first)).toBe(false);
  });
});
