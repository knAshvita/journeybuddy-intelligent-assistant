const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not set in backend/.env");
}

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: apiKey,
  temperature: 0.2,
  maxOutputTokens: 1024,
});

module.exports = { llm };