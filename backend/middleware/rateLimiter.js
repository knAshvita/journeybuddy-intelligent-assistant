const redis = require("../lib/redis");

/**
 * Fixed-Window Rate Limiter via Redis
 * @param {number} limit Maximum requests allowed in the window
 * @param {number} windowInSeconds Window duration in seconds
 */
function rateLimiter(limit = 60, windowInSeconds = 60) {
  return async (req, res, next) => {
    if (!redis) {
      return next(); // Fail open if Redis is not configured
    }

    try {
      const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown_ip";
      const key = `ratelimit:${clientIp}`;

      // Increment counter
      const currentRequests = await redis.incr(key);

      // Set window TTL on first request
      if (currentRequests === 1) {
        await redis.expire(key, windowInSeconds);
      }

      let ttl = await redis.ttl(key);
      if (ttl < 0) ttl = windowInSeconds;

      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - currentRequests));
      res.setHeader("X-RateLimit-Reset", ttl);

      if (currentRequests > limit) {
        console.warn(`🛑 Rate limit exceeded for IP: ${clientIp} (${currentRequests}/${limit})`);
        return res.status(429).json({
          error: "Too Many Requests",
          message: `Request quota of ${limit} requests per ${windowInSeconds}s exceeded. Try again in ${ttl} seconds.`,
          retryAfter: ttl,
        });
      }

      next();
    } catch (err) {
      console.error("⚠️ Rate limiter note:", err.message);
      next(); // Fail open on operational error
    }
  };
}

module.exports = rateLimiter;