const { generateTravelPlan } = require("./langchain/ragPipeline");

async function run() {
  const query = "Give me 10 places to visit in Mangalore";
  const result = await generateTravelPlan(query, 10);

  console.log("\n==================================================");
  console.log("🤖 FINAL SYNTHESIZED LLM ANSWER (VIA GEMINI-3.6-FLASH):");
  console.log("==================================================\n");
  console.log(result.answer);
  console.log("\n📊 Verified Places Fed to Context:", result.places.length);
}

run();