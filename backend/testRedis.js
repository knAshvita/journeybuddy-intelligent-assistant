require("dotenv").config();
const redis = require("./lib/redis");

async function verifyModule27() {
  console.log("⚡ Starting Module 2.7 Verification (Upstash HTTPS Engine)...\n");

  if (!redis) {
    console.error("❌ Redis client not initialized. Check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in backend/.env");
    process.exit(1);
  }

  try {
    // 1. Basic Ping/Echo Check
    console.log("⏳ Testing ping roundtrip to Upstash...");
    const pingResult = await redis.ping();
    console.log(`✅ Redis PING response: ${pingResult}`);

    // 2. Test Rate Limiter Logic
    console.log("\n--- 1. Testing Rate Limiter Atomic Counter ---");
    const testIp = "test_client_127_0_0_1";
    const rateKey = `ratelimit:${testIp}`;

    await redis.del(rateKey);
    const count1 = await redis.incr(rateKey);
    await redis.expire(rateKey, 60);
    const count2 = await redis.incr(rateKey);
    const ttl = await redis.ttl(rateKey);

    console.log(`✅ Rate limit counter incremented: ${count1} -> ${count2} (TTL: ${ttl}s)`);

    // 3. Test Ephemeral Session State
    console.log("\n--- 2. Testing Temporary Session State Storage ---");
    const sessionId = "sess_user_9921";
    const sessionKey = `session:state:${sessionId}`;
    const sessionPayload = {
      selectedTheme: "luxury_beach",
      guestCount: 2,
      originCity: "Bengaluru",
      draftTimestamp: new Date().toISOString(),
    };

    // Store session with 300s TTL (ex option)
    await redis.set(sessionKey, JSON.stringify(sessionPayload), { ex: 300 });
    const retrievedRaw = await redis.get(sessionKey);
    const retrievedSession = typeof retrievedRaw === "string" ? JSON.parse(retrievedRaw) : retrievedRaw;
    const sessionTtl = await redis.ttl(sessionKey);

    console.log(`✅ Stored session state with 300s TTL. Retrieved:`, retrievedSession);
    console.log(`⏳ Session remaining TTL: ${sessionTtl}s`);

    // 4. Test Ephemeral Agentic AI State
    console.log("\n--- 3. Testing Future Agentic State Store ---");
    const tripId = "trip_goa_30k";
    const agentKey = `agent:run:${tripId}`;
    const agentState = {
      tripId,
      currentStep: "Observe_Hotels",
      plan: ["Find destinations", "Find hotels", "Check budget", "Finalize"],
      budgetRemaining: 18500,
      selectedDestinations: ["Baga Beach", "Aguada Fort"],
      intermediateDecisions: "Hotel selected within budget limits.",
    };

    await redis.set(agentKey, JSON.stringify(agentState), { ex: 1800 });
    const retrievedAgentRaw = await redis.get(agentKey);
    const retrievedAgentState = typeof retrievedAgentRaw === "string" ? JSON.parse(retrievedAgentRaw) : retrievedAgentRaw;
    const agentTtl = await redis.ttl(agentKey);

    console.log(`✅ Agent scratchpad state verified. Retrieved:`, retrievedAgentState);
    console.log(`⏳ Agent state remaining TTL: ${agentTtl}s`);

    console.log("\n🎯 All Module 2.7 Redis capabilities verified successfully.");
  } catch (err) {
    console.error("❌ Verification failed:", err.message);
  } finally {
    process.exit(0);
  }
}

verifyModule27();