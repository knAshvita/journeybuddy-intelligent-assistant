const { Redis } = require("@upstash/redis");
require("dotenv").config();

let redis = null;

try {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    redis = new Redis({
      url,
      token,
    });
    console.log("⚡ Upstash REST Redis client initialized successfully.");
  } else {
    console.warn("⚠️ UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN missing in backend/.env");
  }
} catch (err) {
  console.error("❌ Failed to initialize Upstash Redis:", err.message);
}

module.exports = redis;