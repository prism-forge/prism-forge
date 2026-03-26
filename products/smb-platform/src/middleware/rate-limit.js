/**
 * Rate limiting middleware.
 * Uses in-memory store for development. Replace with Redis (Upstash) in production.
 */

const store = new Map();

/**
 * Create a rate limiter.
 * @param {object} options
 * @param {number} options.windowMs - Time window in ms (default: 60000 = 1 min)
 * @param {number} options.max - Max requests per window (default: 60)
 * @param {string} [options.keyPrefix] - Prefix for rate limit keys
 * @returns {Function} Express middleware
 */
export function rateLimit({ windowMs = 60000, max = 60, keyPrefix = 'rl' } = {}) {
  return (req, res, next) => {
    const key = `${keyPrefix}:${req.user?.id || req.ip}`;
    const now = Date.now();

    let record = store.get(key);
    if (!record || now - record.start > windowMs) {
      record = { start: now, count: 0 };
      store.set(key, record);
    }

    record.count++;

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', new Date(record.start + windowMs).toISOString());

    if (record.count > max) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((record.start + windowMs - now) / 1000),
      });
    }

    next();
  };
}

// Plan-based rate limits
export const PLAN_LIMITS = {
  starter: {
    reviewRequests: 50,   // per month
    aiResponses: 10,      // per month
    auditRuns: 1,         // per month
  },
  growth: {
    reviewRequests: -1,   // unlimited
    aiResponses: -1,      // unlimited
    auditRuns: 4,         // per month
  },
  premium: {
    reviewRequests: -1,
    aiResponses: -1,
    auditRuns: 4,
  },
  voice: {
    reviewRequests: -1,
    aiResponses: -1,
    auditRuns: 4,
    voiceMinutes: 200,    // per month
  },
};
