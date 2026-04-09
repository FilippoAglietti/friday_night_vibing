/**
 * src/lib/rate-limiter.ts
 * ─────────────────────────────────────────────────────────────
 * Upstash-backed sliding-window rate limiter.
 *
 * Replaces the previous in-memory `Map<string, RateLimitEntry>` which
 * was resetting on every Vercel serverless cold start — a silent bug
 * that let the same IP blow past the 5/hour cap by simply waiting for
 * a new isolate. That was the root cause of the April 8-9 Anthropic
 * API cost blow-up (20+ generations in a short window from the same
 * IP, each one burning Sonnet tokens on short/full courses that had
 * no business running on Sonnet).
 *
 * How it works:
 *   • Uses @upstash/ratelimit on top of @upstash/redis.
 *   • Sliding window = smoother than fixed window, no edge spikes.
 *   • Namespaced key prefix lets us scope counters per endpoint.
 *   • Fail-open on Upstash errors: if Redis is unreachable, we log
 *     and allow the request. This avoids a Redis outage becoming a
 *     full-site outage. (In production we monitor the log line.)
 *   • Graceful fallback if env vars are missing: returns a no-op
 *     limiter that allows everything. This keeps local dev cheap
 *     (no Upstash account needed for `npm run dev`) while production
 *     — which has the env vars set — gets full enforcement.
 *
 * Required env vars (set in Vercel → Settings → Environment Variables):
 *   • UPSTASH_REDIS_REST_URL
 *   • UPSTASH_REDIS_REST_TOKEN
 *
 * Usage:
 *   const { success } = await generateRateLimit.limit(ip);
 *   if (!success) return 429;
 * ─────────────────────────────────────────────────────────────
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Shape returned by a rate limiter `limit()` call. Mirrors the
 * @upstash/ratelimit RatelimitResponse shape minus the fields we
 * don't surface to callers, so the no-op fallback can match it.
 */
export interface RateLimitResult {
  success: boolean;
  // How many requests remain in the current window. -1 in no-op mode.
  remaining: number;
  // When the window resets (epoch ms). 0 in no-op mode.
  reset: number;
  // Total limit for this window. -1 in no-op mode.
  limit: number;
}

/**
 * Minimal interface any rate limiter in this module must satisfy.
 * Lets us swap between Upstash and a no-op without type friction.
 */
interface RateLimiter {
  limit(identifier: string): Promise<RateLimitResult>;
}

/**
 * No-op limiter used when Upstash env vars are missing (local dev).
 * Always succeeds. Logs a warning once per process so it's obvious
 * in `npm run dev` that rate limiting is inactive.
 */
class NoopRateLimiter implements RateLimiter {
  private warned = false;

  async limit(_identifier: string): Promise<RateLimitResult> {
    // Warn only once per process to avoid spamming dev logs.
    if (!this.warned) {
      console.warn(
        "[rate-limiter] Upstash env vars missing — rate limiting DISABLED. " +
          "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local " +
          "to enable it locally. Production should always have these set.",
      );
      this.warned = true;
    }
    return { success: true, remaining: -1, reset: 0, limit: -1 };
  }
}

/**
 * Upstash-backed limiter. Thin wrapper so we can normalize the
 * response shape to our RateLimitResult interface and fail open.
 */
class UpstashRateLimiter implements RateLimiter {
  private inner: Ratelimit;
  private label: string;

  constructor(inner: Ratelimit, label: string) {
    this.inner = inner;
    this.label = label;
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    try {
      const res = await this.inner.limit(identifier);
      return {
        success: res.success,
        remaining: res.remaining,
        reset: res.reset,
        limit: res.limit,
      };
    } catch (err) {
      // Fail open: Redis outage should not take down the generation path.
      // The log line is the signal that Upstash is misbehaving.
      const msg = err instanceof Error ? err.message : String(err);
      console.error(
        `[rate-limiter] [${this.label}] Upstash error, failing open for ${identifier}: ${msg}`,
      );
      return { success: true, remaining: -1, reset: 0, limit: -1 };
    }
  }
}

/**
 * Factory that wires up the concrete limiter for a given namespace.
 * Kept private — consumers should import the ready-to-use exported
 * limiters below instead of creating their own instances.
 *
 * @param namespace - Used as the Redis key prefix so multiple
 *                    limiters can share the same Upstash DB without
 *                    colliding counters.
 * @param max       - Max requests per window.
 * @param windowStr - Window in @upstash/ratelimit Duration format,
 *                    e.g. "1 h", "10 s", "1 d".
 */
function makeLimiter(
  namespace: string,
  max: number,
  windowStr: `${number} ${"ms" | "s" | "m" | "h" | "d"}`,
): RateLimiter {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // No env vars → no-op. This path fires in local dev and in any
  // deployment where the operator forgot to set the vars. Loud warn
  // in the limiter keeps it from silently disabling in production.
  if (!url || !token) {
    return new NoopRateLimiter();
  }

  const redis = new Redis({ url, token });

  // Sliding window: smoother than fixed window, does not let a user
  // double-burst at the boundary between two windows. @upstash/ratelimit
  // implements this server-side via a Lua script, so it's atomic.
  const inner = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, windowStr),
    analytics: true,       // populate Upstash analytics dashboard
    prefix: `syllabi:${namespace}`,
  });

  return new UpstashRateLimiter(inner, namespace);
}

// ─── Exported limiters ────────────────────────────────────────

/**
 * Rate limiter for POST /api/generate.
 *
 * 5 generations per IP per hour. Matches the legacy in-memory limit
 * so existing UX expectations don't change — the only delta is that
 * this one actually works across cold starts.
 *
 * Sized to be cheap on Upstash Free (10k commands/day): at 5/hour/IP
 * we'd need 83 unique active IPs hitting the cap simultaneously to
 * burn the daily quota. Not a concern at current traffic.
 */
export const generateRateLimit = makeLimiter("generate", 5, "1 h");
