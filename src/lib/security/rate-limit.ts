import { NextResponse } from "next/server";

type RateLimitOptions = {
  namespace: string;
  limit: number;
  windowMs: number;
  key?: string;
};

type Bucket = { count: number; resetAt: number };

declare global {
  var __beewRateLimitBuckets: Map<string, Bucket> | undefined;
}

const buckets = globalThis.__beewRateLimitBuckets ?? new Map<string, Bucket>();
globalThis.__beewRateLimitBuckets = buckets;

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function enforceRateLimit(request: Request, options: RateLimitOptions) {
  const now = Date.now();
  const id = `${options.namespace}:${options.key || clientIp(request)}`;
  const current = buckets.get(id);
  const bucket = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + options.windowMs }
    : current;

  bucket.count += 1;
  buckets.set(id, bucket);

  if (buckets.size > 10_000) {
    for (const [key, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(key);
    }
  }

  const remaining = Math.max(options.limit - bucket.count, 0);
  const headers = {
    "RateLimit-Limit": String(options.limit),
    "RateLimit-Remaining": String(remaining),
    "RateLimit-Reset": String(Math.ceil(bucket.resetAt / 1000)),
    "Cache-Control": "no-store",
  };

  if (bucket.count <= options.limit) return null;

  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        ...headers,
        "Retry-After": String(Math.max(Math.ceil((bucket.resetAt - now) / 1000), 1)),
      },
    }
  );
}

export function rejectOversizedRequest(request: Request, maxBytes: number) {
  const length = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(length) && length > maxBytes) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }
  return null;
}
