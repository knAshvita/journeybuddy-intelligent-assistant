const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { llm } = require("./llm");
const { getHybridContext } = require("./retriever");

// Strict system prompt enforcing factual synthesis from retrieved context
const ragPromptTemplate = PromptTemplate.fromTemplate(`
You are JourneyBuddy AI, an expert, factual travel assistant.

The user asked: "{query}"

You have been provided with the following verified travel destinations retrieved from JourneyBuddy's internal knowledge base and verified external web sources:

{context}

INSTRUCTIONS:
1. Provide a clean, engaging, and well-structured travel guide matching the user's requested destinations.
2. Present each distinct destination in a numbered list (e.g., 1., 2., 3., ...).
3. For each destination, include:
   - **Name**
   - **Category / Theme**
   - **Overview / Highlights**
   - **Source Provenance** (State whether it came from internal database or verified web search)
4. STRICT TRUTH POLICY: Only recommend destinations present in the retrieved context above. DO NOT invent, hallucinate, or pad extra places. If fewer than requested are verified, present only the verified ones.
5. Conclude with a helpful travel tip for the region.

Final Response:
`);

async function generateTravelPlan(query, targetCount = 10) {
  console.log(`\n==================================================`);
  console.log(`🚀 [LangChain RAG] Starting pipeline for: "${query}" (Target: ${targetCount})`);
  console.log(`==================================================`);

  // 1. Hybrid Retrieval Step (Pinecone -> Web Search -> MongoDB sync)
  const retrievedPlaces = await getHybridContext(query, targetCount);

  if (!retrievedPlaces || retrievedPlaces.length === 0) {
    return {
      query,
      answer: `I could not locate verified destination data for "${query}". Please check your query terms.`,
      sources: [],
    };
  }

  // 2. Format Context for Prompt Injection
  const contextString = retrievedPlaces
    .map(
      (p, i) =>
        `[${i + 1}] Title: ${p.title}\n    Category: ${p.category}\n    Description: ${p.description}\n    Estimated Price: $${p.price_usd}\n    Source: ${p.source}`
    )
    .join("\n\n");

  // 3. Fallback check if Gemini API key is missing
  if (!llm) {
    console.warn("⚠️ LLM instance not available. Returning structured rule-based synthesis.");
    const fallbackAnswer = retrievedPlaces
      .map((p, i) => `${i + 1}. **${p.title}** (${p.category}) - ${p.description} [Source: ${p.source}]`)
      .join("\n\n");

    return {
      query,
      answer: fallbackAnswer,
      places: retrievedPlaces,
    };
  }

  // 4. Execute LangChain Pipeline (Prompt -> LLM -> String Output)
  const chain = ragPromptTemplate.pipe(llm).pipe(new StringOutputParser());

  const responseText = await chain.invoke({
    query: query,
    context: contextString,
  });

  return {
    query,
    answer: responseText,
    places: retrievedPlaces,
  };
}

module.exports = { generateTravelPlan };