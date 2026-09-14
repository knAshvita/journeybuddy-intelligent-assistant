const { runTravelAgent } = require("./langchain/agent");

async function test() {
  const result = await runTravelAgent({
    query: "Find budget lodges and compute expenses",
    destination: "Karkala",
    travelContext: { members: 2, days: 2, budget: 10000 },
  });

  console.log("\n✅ Agent finished execution successfully!");
  console.log("Trip ID:", result.tripId);
  console.log("Trace steps:", result.agentTrace.map((t) => t.step));
  console.log("\nFinal Answer Sample:\n", result.answer.slice(0, 300) + "...");
}

test(); 