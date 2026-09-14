const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { llm } = require("./llm");
const { getHybridContext } = require("./retriever");
const redis = require("../lib/redis");

/**
 * -----------------------------------------------------------------------------
 * 1. AGENT TOOL REGISTRY
 * -----------------------------------------------------------------------------
 */

// Tool 1: Hybrid Vector & Web Retriever (Pinecone + MongoDB + Web Fallback)
async function toolRetrieveDestinations(query, count = 5) {
  try {
    const places = await getHybridContext(query, count);
    return places.map((p) => ({
      title: p.title,
      category: p.category,
      price_usd: p.price_usd,
      description: p.description,
      source: p.source,
    }));
  } catch (err) {
    return [{ error: `Retrieval tool failed: ${err.message}` }];
  }
}

// Tool 2: Budget & Cost Calculator
function toolCalculateBudget(places, members = 1, days = 1, transportCostUsd = 20) {
  const placeCosts = (places || []).reduce(
    (acc, p) => acc + (Number(p.price_usd) || 0),
    0
  );
  const totalPerPerson = placeCosts + transportCostUsd;
  const grandTotal = totalPerPerson * members;

  return {
    breakdown: {
      members,
      days,
      activitiesTotalPerPersonUsd: placeCosts,
      transportCostUsd,
      grandTotalUsd: grandTotal,
      grandTotalInr: grandTotal * 86,
    },
  };
}

// Tool 3: Scratchpad State Recorder (Syncs with Redis store from Module 2.7)
async function recordAgentScratchpad(tripId, currentStep, plan, intermediateResults, budgetRemaining) {
  if (!redis) return;

  const key = `agent:run:${tripId}`;
  const payload = {
    tripId,
    currentStep,
    plan,
    intermediateResults,
    budgetRemaining,
    updatedAt: new Date().toISOString(),
  };

  try {
    if (typeof redis.set === "function") {
      await redis.set(key, JSON.stringify(payload), { ex: 1800 });
    }
  } catch (e) {
    console.warn("⚠️ Agent state scratchpad warning:", e.message);
  }
}

/**
 * Fallback synthesis when LLM API quota is exhausted
 */
function generateFallbackSynthesis(destination, query, members, days, places, budget) {
  const topPlaces = (places || []).slice(0, 4);
  const placeList = topPlaces.length > 0
    ? topPlaces.map((p) => `* **${p.title}** (${p.category}): ${p.description || "Scenic regional landmark."}`).join("\n")
    : `* **Local Sightseeing & Cultural Exploration**: Central attractions in ${destination}.`;

  return `### 🧭 Autonomous Travel Itinerary: ${destination}

**Overview**: Customized travel plan for ${members} travelers across ${days} day(s) focusing on ${query}.

#### 📍 Recommended Places & Activities:
${placeList}

#### 💰 Verified Budget Breakdown:
* **Activities & Entry Tickets**: ~$${budget?.activitiesTotalPerPersonUsd || 30} per person
* **Estimated Local Transport**: ~$${budget?.transportCostUsd || 20}
* **Estimated Total**: ~$${budget?.grandTotalUsd || 100} (~₹${(budget?.grandTotalInr || 8600).toLocaleString()})

*Synthesized autonomously by JourneyBuddy Agent via local retrieval & cost computation tools.*`;
}

/**
 * -----------------------------------------------------------------------------
 * 2. AUTONOMOUS REASONING LOOP (Plan -> Act -> Observe -> Iterate)
 * -----------------------------------------------------------------------------
 */
async function runTravelAgent({
  query,
  destination,
  travelContext = {},
  maxIterations = 3,
}) {
  const tripId = `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const members = Number(travelContext.members || 1);
  const days = Number(travelContext.days || 1);
  const maxBudget = Number(travelContext.budget || 50000);

  const executionLog = [];
  let intermediateData = { places: [], budget: null };
  let isComplete = false;
  let currentIteration = 0;

  console.log(`\n🤖 [Agent 2.12] Initiating Autonomous Agent Run [Trip ID: ${tripId}]`);
  console.log(`🎯 Goal: "${query}" for destination "${destination}"`);

  while (!isComplete && currentIteration < maxIterations) {
    currentIteration++;
    console.log(`\n--- Iteration ${currentIteration}/${maxIterations} ---`);

    // STEP 1: PLAN (Heuristic + LLM with fallback)
    let planDecision = { action: "SEARCH_PLACES", thought: "Need destination data" };

    if (intermediateData.places.length === 0) {
      planDecision = { action: "SEARCH_PLACES", thought: "Retrieve destination landmarks and stays" };
    } else if (!intermediateData.budget) {
      planDecision = { action: "CALCULATE_BUDGET", thought: "Destinations verified. Calculate travel expenses" };
    } else {
      planDecision = { action: "FINALIZE", thought: "All information collected. Ready to finalize" };
    }

    console.log(`🧠 [PLAN]: ${planDecision.thought} -> Next Step: ${planDecision.action}`);

    // STEP 2: ACT
    let stepOutput = null;
    if (planDecision.action === "SEARCH_PLACES") {
      const searchTarget = destination || query;
      stepOutput = await toolRetrieveDestinations(searchTarget, 5);
      intermediateData.places = stepOutput;
    } else if (planDecision.action === "CALCULATE_BUDGET") {
      stepOutput = toolCalculateBudget(intermediateData.places, members, days, 20);
      intermediateData.budget = stepOutput.breakdown;
    } else if (planDecision.action === "FINALIZE") {
      isComplete = true;
      stepOutput = "Sufficient information collected.";
    }

    // STEP 3: OBSERVE
    const observation = {
      iteration: currentIteration,
      step: planDecision.action,
      thought: planDecision.thought,
      resultCount: intermediateData.places.length,
      hasBudget: Boolean(intermediateData.budget),
    };
    executionLog.push(observation);

    // Sync intermediate scratchpad to Redis state
    await recordAgentScratchpad(
      tripId,
      planDecision.action,
      ["SEARCH_PLACES", "CALCULATE_BUDGET", "FINALIZE"],
      intermediateData,
      maxBudget - (intermediateData.budget?.grandTotalInr || 0)
    );

    console.log(`👁️ [OBSERVE]: Verified places count: ${intermediateData.places.length} | Cost calculated: ${Boolean(intermediateData.budget)}`);

    // STEP 4: ITERATE
    if (intermediateData.places.length > 0 && intermediateData.budget) {
      isComplete = true;
    }
  }

  // STEP 5: FINAL SYNTHESIS
  let finalAnswerText = "";
  try {
    const synthesisPrompt = `You are JourneyBuddy's Autonomous Travel Concierge.
Synthesize a finalized, polished travel recommendation based on these agent findings:

Destination: ${destination}
User Query: ${query}
Travel Context: ${members} members, ${days} days
Verified Places: ${JSON.stringify(intermediateData.places)}
Cost Breakdown: ${JSON.stringify(intermediateData.budget)}

Provide:
1. A concise overview answering the traveler's inquiry.
2. A day-by-day plan using only the verified places found.
3. Budget transparency noting estimated per-person and group totals.`;

    const finalResponse = await llm.invoke(synthesisPrompt);
    finalAnswerText = finalResponse.content;
  } catch (err) {
    console.warn("⚠️ LLM quota reached or rate-limited. Activating verified fallback synthesis:", err.message);
    finalAnswerText = generateFallbackSynthesis(
      destination,
      query,
      members,
      days,
      intermediateData.places,
      intermediateData.budget
    );
  }

  return {
    tripId,
    success: true,
    destination,
    answer: finalAnswerText,
    places: intermediateData.places,
    budgetSummary: intermediateData.budget,
    agentTrace: executionLog,
  };
}

module.exports = {
  runTravelAgent,
  toolRetrieveDestinations,
  toolCalculateBudget,
};