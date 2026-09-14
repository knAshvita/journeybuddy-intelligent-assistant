const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { llm } = require("./llm");
const { getHybridContext } = require("./retriever");

const SYSTEM_PROMPT = `You are JourneyBuddy AI, a practical and realistic travel assistant.
The traveler is inquiring about: "{destination}".

STRICT LOGIC RULES:
1. DURATION & NIGHTS ACCURACY:
   - For a 1-DAY tour/trip: It is a DAY TRIP (0 nights accommodation). Do NOT charge for overnight hotel stays unless a day-use rest room is explicitly requested.
   - For a 2-day trip: It is 1 night stay.
   - For an N-day trip: Nights = N - 1.
2. BUDGET & TOTAL ACCURACY:
   - Itemize: Stay (if overnight), Food, Local Transport, Activities & Entry.
   - State the clear, exact arithmetic sum as the **Final Total Budget** in INR (₹).
3. If the user clicks "1-Day Quick Tour":
   - Provide a morning-to-evening schedule (Morning, Afternoon, Sunset/Evening).
   - Follow with an itemized 1-Day Budget (0 Nights Stay, Food, Transport, Entry) and the final calculated total.

VERIFIED REGIONAL CONTEXT:
{context}

CONVERSATION HISTORY:
{history}

ACTIVE PARAMETERS:
- Destination: {destination}
- Travelers: {travelers}
- Duration (Days): {days}
- Transport: {transport}
- Budget: {budget}`;

function generateIntelligentFallback(query, destination, travelContext) {
  const dest = destination || "this destination";
  const q = query.toLowerCase();

  // 1. Detect Trip Duration (Days & Nights)
  let days = travelContext?.days || 1;
  const dayMatch = query.match(/(\d+)\s*(?:day|days)/i);
  if (dayMatch) {
    days = parseInt(dayMatch[1], 10);
  } else if (q.includes("1-day") || q.includes("one day") || q.includes("quick tour") || q.includes("day tour")) {
    days = 1;
  } else if (q.includes("2-day") || q.includes("weekend")) {
    days = 2;
  }

  const nights = days > 1 ? days - 1 : 0;

  // 2. Detect Traveler Count (Strictly avoids picking up "1-day" as 1 traveler)
  let travelers = travelContext?.members || 1;
  const travelerMatch = query.match(/(\d+)\s*(?:people|members|persons|travelers|pax)/i);
  if (travelerMatch) {
    travelers = parseInt(travelerMatch[1], 10);
  } else if (/^\s*👥?\s*(\d+)\s*$/.test(query)) {
    travelers = parseInt(query.match(/\d+/)[0], 10);
  }

  const lodgeName = travelContext?.selectedLodge || "Nearby Lodge / Stay";

  // 3. Handle 1-Day Quick Tour
  if (q.includes("1-day") || q.includes("quick tour") || q.includes("one day")) {
    const food = travelers * 450; // Lunch, snacks, beverages
    const transport = travelers > 2 ? 1400 : 700; // Auto/Cab or fuel
    const entryActivities = travelers * 150;
    const finalTotal = food + transport + entryActivities;

    return `### 🗓️ 1-Day Quick Tour Itinerary: ${dest}

* **Morning (9:00 AM - 12:30 PM)**: Arrival & guided exploration of the core landmark, admiring architecture and cultural exhibits. (~Free / ₹50 entry)
* **Afternoon (1:00 PM - 3:30 PM)**: Traditional coastal lunch at a nearby authentic diner, followed by local garden walks and photography. (~₹300/person)
* **Late Afternoon & Sunset (4:00 PM - 6:30 PM)**: Scenic promenade or beach viewpoint visit, evening tea, and souvenir shopping. (~₹100/person)

---

### 💰 Itemized 1-Day Tour Budget (${travelers} Traveler${travelers > 1 ? "s" : ""})

* **Accommodation (Day Trip)**: ₹0 (No overnight stay required for a 1-day tour)
* **Food & Coastal Dining (${travelers} pax)**: ~₹${food.toLocaleString()} (Lunch, fresh tender coconut, snacks)
* **Local Transport & Transit**: ~₹${transport.toLocaleString()} (Local cab/auto or city transit)
* **Activities & Entry Fees**: ~₹${entryActivities.toLocaleString()} (Monument entry and camera passes)
* **Final Total Budget**: ~₹${finalTotal.toLocaleString()} (~₹${Math.round(finalTotal / travelers).toLocaleString()} per person)

*Note: All prices are realistic approximate estimates for planning purposes.*`;
  }

  // 4. Handle Multi-Day Budget Calculation
  if (
    q.includes("budget") ||
    q.includes("cost") ||
    q.includes("₹") ||
    travelerMatch ||
    q.includes("people")
  ) {
    const rooms = Math.ceil(travelers / 2);
    const roomCost = nights > 0 ? rooms * 1400 * nights : 0;
    const foodCost = travelers * 550 * days;
    const transportCost = travelers > 4 ? 1800 * days : 1100 * days;
    const activitiesCost = travelers * 200 * days;
    const finalTotal = roomCost + foodCost + transportCost + activitiesCost;

    return `### 💰 Estimated ${days}-Day Budget for ${travelers} Traveler${travelers > 1 ? "s" : ""} (${dest})
Selected Stay: **${lodgeName}**

* **Accommodation (${rooms} Room${rooms > 1 ? "s" : ""} x ${nights} Night${nights > 1 ? "s" : ""})**: ${
      nights > 0
        ? `~₹${roomCost.toLocaleString()} (Approx. ₹1,400/room/night)`
        : "₹0 (Day trip, no overnight stay)"
    }
* **Food & Dining (${travelers} pax x ${days} Days)**: ~₹${foodCost.toLocaleString()} (Breakfast, lunch, dinner, drinks)
* **Local Transport & Fuel**: ~₹${transportCost.toLocaleString()} (Local travel and parking)
* **Activities & Sightseeing**: ~₹${activitiesCost.toLocaleString()} (Entry tickets and sundries)
* **Final Total Budget**: ~₹${finalTotal.toLocaleString()} (~₹${Math.round(finalTotal / travelers).toLocaleString()} per person)

*Note: Estimates calculated based on standard seasonal rates.*`;
  }

  // 5. Lodges Fallback
  if (q.includes("lodge") || q.includes("hotel") || q.includes("stay") || q.includes("accommodation")) {
    return `### 🏨 Recommended Affordable Stays Near ${dest}

* **Coastal Breeze Residency (Near Main Road)**: Clean AC and non-AC rooms with secure parking. (~₹1,200 - ₹1,600/night)
* **Surathkal Comfort Guest House (10 mins away)**: Budget-friendly rooms with 24/7 hot water and Wi-Fi. (~₹1,000 - ₹1,400/night)
* **Portview Express Inn (Transit Hub)**: Compact, clean rooms ideal for quick stays. (~₹900 - ₹1,300/night)

*Note: Room tariffs and availability are approximate seasonal estimates.*`;
  }

  // 6. General Overview
  return `### 📍 Essential Travel Guide for ${dest}

* **Best Time to Visit**: October through March for pleasant weather.
* **Estimated Time Needed**: 2 to 3 hours for a complete visit.
* **Travel Tip**: Morning hours are best for avoiding queues and midday heat.`;
}

async function generateChatbotResponse({
  query = "",
  destination = "",
  history = [],
  travelContext = {},
  targetCount = 10,
} = {}) {
  const safeQuery = (query || "").trim();
  const safeDest = (destination || travelContext?.destination || "").trim();

  if (!safeQuery && !safeDest) {
    throw new Error("Either a query or destination parameter is required.");
  }

  const retrievalQuery = safeDest || safeQuery;
  let retrievedPlaces = [];
  try {
    retrievedPlaces = await getHybridContext(retrievalQuery, targetCount);
  } catch (err) {
    console.warn("⚠️ Hybrid retrieval warning:", err.message);
  }

  const contextString = Array.isArray(retrievedPlaces) && retrievedPlaces.length > 0
    ? retrievedPlaces
        .map(
          (p, i) =>
            `${i + 1}. ${p.title} (${p.category || "Attraction"}) - ${p.description || ""} (~$${p.price_usd || 10})`
        )
        .join("\n")
    : "Standard regional geography and travel facts.";

  const historyString = Array.isArray(history) && history.length > 0
    ? history
        .map((m) => `${m.role === "user" ? "Traveler" : "JourneyBuddy AI"}: ${m.content}`)
        .join("\n")
    : "None.";

  // Determine logical days & nights
  let days = travelContext?.days || 1;
  const dMatch = safeQuery.match(/(\d+)\s*(?:day|days)/i);
  if (dMatch) days = parseInt(dMatch[1], 10);
  else if (/1-day|one day|quick tour/i.test(safeQuery)) days = 1;

  const chatPrompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    ["human", "{query}"],
  ]);

  const outputParser = new StringOutputParser();
  let answer = "";

  try {
    const chain = chatPrompt.pipe(llm).pipe(outputParser);
    answer = await chain.invoke({
      context: contextString,
      history: historyString,
      destination: safeDest || "this destination",
      travelers: travelContext?.members || "1",
      days: `${days} (${days === 1 ? "Day trip, 0 nights" : `${days - 1} nights`})`,
      transport: travelContext?.transport || "Car",
      budget: travelContext?.budget ? `₹${travelContext.budget}` : "Flexible",
      query: safeQuery,
    });
  } catch (llmErr) {
    console.warn("⚠️ Fallback active:", llmErr.message);
    answer = generateIntelligentFallback(safeQuery, safeDest, travelContext);
  }

  let bookingLink = null;
  const lower = (safeQuery + " " + answer).toLowerCase();
  if (lower.includes("bus") || lower.includes("book") || lower.includes("redbus") || lower.includes("transport")) {
    const destParam = encodeURIComponent(safeDest || "Mangalore");
    bookingLink = `https://www.redbus.in/bus-tickets/${destParam}`;
  }

  return {
    success: true,
    answer,
    destination: safeDest,
    places: retrievedPlaces,
    bookingLink,
    travelContext: { ...travelContext, days },
    sources: retrievedPlaces.map((p) => ({
      title: p.title,
      source: p.source,
      category: p.category,
    })),
  };
}

module.exports = { generateChatbotResponse };