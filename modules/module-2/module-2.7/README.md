# ⚡ Module 2.7: Redis In-Memory Data Store

Implementation of high-speed in-memory rate limiting, volatile session management, and ephemeral agent scratchpad memory for JourneyBuddy.

---

## 1. Architectural Boundaries & Distinct Datastore Roles

Redis is explicitly not used as a cache layer over Pinecone or MongoDB search results. Every datastore maintains a clear, non-redundant architectural responsibility:

* **MongoDB Atlas:** Permanent application data store (user accounts, confirmed itineraries, destinations, historical operational records).
* **Pinecone:** Dedicated cloud vector database executing Approximate Nearest Neighbor (ANN) cosine similarity search over embeddings.
* **Web Search:** External retrieval fallback for fresh or uncataloged real-world travel information.
* **Redis (Upstash HTTPS Engine):** High-throughput volatile memory layer handling:
  1. **API Rate Limiting:** Fixed-window request counters protecting gateway endpoints from abuse.
  2. **Temporary User / Session State:** Short-lived draft criteria and transient interaction payloads.
  3. **Ephemeral Agent State:** Execution scratchpad holding multi-step reasoning loops (Plan → Act → Observe → Iterate) before committing finalized trips to MongoDB.

---

## 2. Implemented Capabilities

* **API Rate Limiting Middleware (`middleware/rateLimiter.js`):** Tracks client IP requests with atomic counters and automatic TTL window expiration.
* **Ephemeral User / Session State (`/api/session/state`):** Stores transient draft preferences with explicit Time-To-Live auto-eviction.
* **Agent Execution Scratchpad (`/api/agent/state`):** Manages multi-step intermediate planning state prior to database commitment.

---

## 3. Verification Test Output (`testRedis.js`)

```text
⚡ Upstash REST Redis client initialized successfully.
⚡ Starting Module 2.7 Verification (Upstash HTTPS Engine)...

⏳ Testing ping roundtrip to Upstash...
✅ Redis PING response: PONG

--- 1. Testing Rate Limiter Atomic Counter ---
✅ Rate limit counter incremented: 1 -> 2 (TTL: 60s)

--- 2. Testing Temporary Session State Storage ---
✅ Stored session state with 300s TTL. Retrieved: {
  selectedTheme: 'luxury_beach',
  guestCount: 2,
  originCity: 'Bengaluru',
  draftTimestamp: '2026-09-13T00:25:07.580Z'
}
⏳ Session remaining TTL: 300s

--- 3. Testing Future Agentic State Store ---
✅ Agent scratchpad state verified. Retrieved: {
  tripId: 'trip_goa_30k',
  currentStep: 'Observe_Hotels',
  plan: [ 'Find destinations', 'Find hotels', 'Check budget', 'Finalize' ],
  budgetRemaining: 18500,
  selectedDestinations: [ 'Baga Beach', 'Aguada Fort' ],
  intermediateDecisions: 'Hotel selected within budget limits.'
}
⏳ Agent state remaining TTL: 1800s

🎯 All Module 2.7 Redis capabilities verified successfully.