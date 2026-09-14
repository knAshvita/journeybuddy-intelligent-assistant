const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { llm } = require("../langchain/llm");
const redis = require("../lib/redis");

const { destinationSearchTool } = require("./tools/destinationSearchTool");
const { webSearchTool } = require("./tools/webSearchTool");
const { accommodationTool } = require("./tools/accommodationTool");
const { transportTool } = require("./tools/transportTool");
const { budgetTool } = require("./tools/budgetTool");
const { itineraryTool } = require("./tools/itineraryTool");

async function recordScratchpadState(tripId, step, plan, intermediate, budgetStatus) {
  if (!redis) return;
  const key = `agent:scratchpad:${tripId}`;
  const payload = {
    tripId,
    currentStep: step,
    activePlan: plan,
    intermediateResults: intermediate,
    budgetStatus,
    timestamp: new Date().toISOString(),
  };

  try {
    if (typeof redis.set === "function") {
      await redis.set(key, JSON.stringify(payload), { ex: 1800 });
    }
  } catch (e) {
    console.warn("⚠️ Redis scratchpad notice:", e.message);
  }
}

function synthesizeFallbackTrip(destination, userQuery, context, intermediate, budgetData, itineraryData) {
  const stay = intermediate.accommodations?.[0]?.title || "Verified Local Lodge";
  const stayTariff = intermediate.accommodations?.[0]?.pricePerNightInr || 1400;

  return `### 🧭 Autonomous Travel Itinerary: ${destination}

**Objective**: ${userQuery}
**Profile**: ${context.members} Travelers | ${context.days} Days | Target Budget: ₹${context.budget.toLocaleString()}

---

#### 📍 Planned Itinerary (Day-by-Day):
${(itineraryData.schedule || [])
  .map((s) => `* **Day ${s.day}**: Morning:${s.morning} | Afternoon: ${s.afternoon} \vert{} Evening:${s.evening}`)
  .join("\n")}

---

#### 🏨 Verified Accommodation:
* **Selected Stay**: **${stay}** (~₹${stayTariff}/night)
* **Rooms Allocated**: ${budgetData.breakdown.roomsAllocated} room(s) for ${context.members} guests.

---

#### 💰 Deterministic Budget Verification:
* **Accommodation (${budgetData.breakdown.nightsStayed} night(s))**: ₹${budgetData.breakdown.itemizedInr.accommodation.toLocaleString()}
* **Transport (${context.transport})**: ₹${budgetData.breakdown.itemizedInr.transport.toLocaleString()}
* **Food & Meals**: ₹${budgetData.breakdown.itemizedInr.food.toLocaleString()}
* **Activities & Entry**: ₹${budgetData.breakdown.itemizedInr.activities.toLocaleString()}
* **Calculated Total Cost**: **₹${budgetData.breakdown.grandTotalInr.toLocaleString()}**
* **Budget Status**: ${budgetData.breakdown.isWithinBudget ? `✅ Under Budget by ₹${budgetData.breakdown.remainingBudgetInr.toLocaleString()}` : `⚠️ Exceeds Budget by ₹${Math.abs(budgetData.breakdown.remainingBudgetInr).toLocaleString()}`}

---

#### 🚌 Transportation & Booking:
Direct bus links available via [Official RedBus Ticket Portal](https://www.redbus.in/bus-tickets/${encodeURIComponent(destination)}).
*(Note: Booking redirects to official portal; no automated financial charge executed).*`;
}

async function runTravelAgent({
  query,
  destination,
  travelContext = {},
  maxIterations = 5,
}) {
  const tripId = `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const destName = destination || "Karkala";
  const members = Number(travelContext.members || 4);
  const days = Number(travelContext.days || 3);
  const budget = Number(travelContext.budget || 15000);
  const transport = travelContext.transport || "Bus";

  const context = { members, days, budget, transport };
  const executionLog = [];
  const intermediate = {
    destinations: [],
    accommodations: [],
    transportInfo: null,
    budgetAudit: null,
    itinerarySchedule: null,
  };

  let isComplete = false;
  let iteration = 0;

  console.log(`\n🤖 [Module 2.12] Autonomous Agent Activated [Trip ID: ${tripId}]`);
  console.log(`🎯 Goal: "${query}" | Destination: "${destName}" | Budget: ₹${budget}`);

  while (!isComplete && iteration < maxIterations) {
    iteration++;
    console.log(`\n--- Iteration ${iteration}/${maxIterations} ---`);

    // 1. PLAN
    let chosenAction = "SEARCH_DESTINATIONS";
    let planThought = "";

    if (intermediate.destinations.length === 0) {
      chosenAction = "SEARCH_DESTINATIONS";
      planThought = "Need verified regional landmarks and attractions first.";
    } else if (intermediate.accommodations.length === 0) {
      chosenAction = "SEARCH_ACCOMMODATION";
      planThought = "Attractions found. Need budget lodges under room tariff constraints.";
    } else if (!intermediate.transportInfo) {
      chosenAction = "CHECK_TRANSPORT";
      planThought = "Lodges verified. Need transit route pricing and operator links.";
    } else if (!intermediate.budgetAudit) {
      chosenAction = "CALCULATE_BUDGET";
      planThought = "All component costs known. Running deterministic arithmetic budget verification.";
    } else if (!intermediate.itinerarySchedule) {
      chosenAction = "BUILD_ITINERARY";
      planThought = "Budget satisfies constraint. Structuring day-by-day itinerary schedule.";
    } else {
      chosenAction = "FINALIZE";
      planThought = "All goals satisfied. Ready to synthesize final trip response.";
    }

    console.log(`🧠 [PLAN]: ${planThought} -> Action: ${chosenAction}`);

    // 2. ACT
    if (chosenAction === "SEARCH_DESTINATIONS") {
      const destResult = await destinationSearchTool("attractions nature heritage", destName, 6);
      intermediate.destinations = destResult.places;
    } else if (chosenAction === "SEARCH_ACCOMMODATION") {
      const accomResult = await accommodationTool(destName, 2500);
      intermediate.accommodations = accomResult.accommodations;
    } else if (chosenAction === "CHECK_TRANSPORT") {
      const transResult = transportTool("Regional Hub", destName, transport, members);
      intermediate.transportInfo = transResult;
    } else if (chosenAction === "CALCULATE_BUDGET") {
      const roomTariff = intermediate.accommodations[0]?.pricePerNightInr || 1400;
      const transTotal = intermediate.transportInfo?.estimatedTotalTransitInr || 1200;
      intermediate.budgetAudit = budgetTool({
        members,
        days,
        userBudgetInr: budget,
        roomNightRateInr: roomTariff,
        transportCostTotalInr: transTotal,
        activitiesCostPerPersonInr: 250,
        dailyFoodPerPersonInr: 400,
      });
    } else if (chosenAction === "BUILD_ITINERARY") {
      intermediate.itinerarySchedule = itineraryTool(destName, days, intermediate.destinations);
    } else if (chosenAction === "FINALIZE") {
      isComplete = true;
    }

    // 3. OBSERVE & 4. EVALUATE
    const observation = {
      iteration,
      action: chosenAction,
      thought: planThought,
      hasDestinations: intermediate.destinations.length > 0,
      hasAccommodation: intermediate.accommodations.length > 0,
      hasTransport: Boolean(intermediate.transportInfo),
      budgetVerified: Boolean(intermediate.budgetAudit),
      isWithinBudget: intermediate.budgetAudit?.breakdown?.isWithinBudget || false,
    };
    executionLog.push(observation);

    await recordScratchpadState(tripId, chosenAction, chosenAction, intermediate, intermediate.budgetAudit);

    console.log(
      `👁️ [OBSERVE]: Places: ${intermediate.destinations.length} | Stays: ${intermediate.accommodations.length} | Budget OK: ${observation.isWithinBudget}`
    );

    if (
      intermediate.destinations.length > 0 &&
      intermediate.accommodations.length > 0 &&
      intermediate.transportInfo &&
      intermediate.budgetAudit &&
      intermediate.itinerarySchedule
    ) {
      isComplete = true;
    }
  }

  // 5. SYNTHESIZE
  let finalItinerary = "";
  try {
    const prompt = `You are JourneyBuddy AI Autonomous Concierge.
Synthesize the final travel plan using the verified agent data:
Destination: ${destName}
Goal: ${query}
Context: ${members} travelers, ${days} days, ₹${budget} budget, ${transport} transport.
Verified Places: ${JSON.stringify(intermediate.destinations)}
Verified Stays: ${JSON.stringify(intermediate.accommodations)}
Budget Audit: ${JSON.stringify(intermediate.budgetAudit)}
Itinerary Schedule: ${JSON.stringify(intermediate.itinerarySchedule)}

Format a clean Markdown plan with overview, day-by-day plan, budget breakdown, and booking disclaimers.`;

    const res = await llm.invoke(prompt);
    finalItinerary = res.content;
  } catch (err) {
    console.warn("⚠️ Synthesis using fallback format:", err.message);
    finalItinerary = synthesizeFallbackTrip(
      destName,
      query,
      context,
      intermediate,
      intermediate.budgetAudit,
      intermediate.itinerarySchedule
    );
  }

  return {
    tripId,
    success: true,
    destination: destName,
    answer: finalItinerary,
    places: intermediate.destinations,
    accommodations: intermediate.accommodations,
    budgetSummary: intermediate.budgetAudit?.breakdown,
    agentTrace: executionLog,
  };
}

module.exports = { runTravelAgent };