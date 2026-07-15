const jsonResponse = { status: 429 };
jest.mock("next/server", () => ({
  NextResponse: { json: jest.fn(() => jsonResponse) },
}));

import { enforceRateLimit, rejectOversizedRequest } from "@/lib/security/rate-limit";

describe("API abuse controls", () => {
  const request = {
    headers: new Headers({ "x-forwarded-for": "203.0.113.10" }),
  } as Request;

  it("blocks requests above a fixed-window limit", () => {
    const namespace = `test-${Date.now()}`;
    expect(enforceRateLimit(request, { namespace, limit: 1, windowMs: 60_000 })).toBeNull();
    expect(enforceRateLimit(request, { namespace, limit: 1, windowMs: 60_000 })).toBe(jsonResponse);
  });

  it("rejects a declared oversized request", () => {
    const oversized = { headers: new Headers({ "content-length": "101" }) } as Request;
    expect(rejectOversizedRequest(oversized, 100)).toBe(jsonResponse);
  });
});
