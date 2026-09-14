const { llm } = require("./langchain/llm");
require("dotenv").config();

async function testConnection() {
  console.log("⚡ Testing LangChain + Google Gemini LLM connection...");

  if (!llm) {
    console.error("❌ LLM instance not initialized. Ensure GEMINI_API_KEY is defined in backend/.env");
    process.exit(1);
  }

  try {
    const response = await llm.invoke("Respond with: 'JourneyBuddy LangChain Orchestrator Active'");
    console.log("✅ LLM Response Received:");
    console.log(response.content);
  } catch (err) {
    console.error("❌ Gemini invocation failed:", err.message);
  }
}

testConnection();