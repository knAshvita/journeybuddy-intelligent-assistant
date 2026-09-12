const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

const pineconeApiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX || "journeybuddy-destinations";

if (!pineconeApiKey) {
  console.error("❌ Missing PINECONE_API_KEY in backend/.env");
  process.exit(1);
}

const pc = new Pinecone({ apiKey: pineconeApiKey });

async function searchPinecone() {
  try {
    const pineconeIndex = pc.index(indexName);

    // Simulated query vector for: "cold snowy mountain chalets"
    // High weights on dims 0 and 1, matching our Swiss Alps sanctuary
    const queryVector = [0.85, 0.89, 0.08, 0.10, 0.01, 0.04, 0.12, 0.05];

    console.log(`🌲 Querying Pinecone index: "${indexName}"...\n`);

    const queryResponse = await pineconeIndex.query({
      vector: queryVector,
      topK: 2,
      includeMetadata: true,
    });

    console.log("✅ Pinecone Semantic Similarity Results:");
    const tableData = queryResponse.matches.map((match) => ({
      mongo_id: match.id,
      title: match.metadata?.title,
      category: match.metadata?.category,
      price_usd: match.metadata?.price_usd,
      score: match.score,
    }));

    console.table(tableData);

    // Similarity Threshold Check (For Web Search Routing)
    const SIMILARITY_THRESHOLD = 0.75;
    const topMatch = queryResponse.matches[0];

    if (topMatch && topMatch.score >= SIMILARITY_THRESHOLD) {
      console.log(`🎯 Strong internal match found (${topMatch.score.toFixed(4)} >= ${SIMILARITY_THRESHOLD}).`);
      console.log(`➡️ Action: Answer directly from Pinecone + MongoDB data.`);
    } else {
      console.log(`⚠️ Low similarity (${topMatch ? topMatch.score.toFixed(4) : 0} < ${SIMILARITY_THRESHOLD}).`);
      console.log(`➡️ Action: Trigger live Web Search fallback.`);
    }
  } catch (err) {
    console.error("❌ Pinecone query failed:", err.message);
  }
}

searchPinecone();