const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not set in backend/.env");
}

// Initialize ChatGoogleGenerativeAI with the active gemini-3.6-flash model
const llm = apiKey
  ? new ChatGoogleGenerativeAI({
      apiKey: apiKey,
      model: "gemini-3.6-flash",
      temperature: 0.2, // Low temperature to prevent hallucination and enforce factual adherence
      maxOutputTokens: 2048,
    })
  : null;

module.exports = { llm };