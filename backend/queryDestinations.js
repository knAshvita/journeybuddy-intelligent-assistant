


const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ Error: MONGODB_URI is not set in backend/.env");
  process.exit(1);
}

const client = new MongoClient(uri);

// Query vector representing a search for: "cold snowy mountain chalets"
// Matches high dimensions (0 and 1) similar to our Swiss Alps sanctuary
const queryVector = [0.85, 0.89, 0.08, 0.10, 0.01, 0.04, 0.12, 0.05];

async function runVectorSearch() {
  try {
    await client.connect();
    const db = client.db("journeybuddy");
    const collection = db.collection("destinations");

    console.log("⚡ Executing MongoDB Atlas $vectorSearch aggregation pipeline...\n");

    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 10,
          limit: 2
        }
      },
      {
        $project: {
          _id: 0,
          title: 1,
          category: 1,
          price_usd: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ];

    const results = await collection.aggregate(pipeline).toArray();

    console.log("✅ Semantic Vector Search Results (Ranked by Cosine Similarity):");
    console.table(results);

  } catch (err) {
    console.error("❌ Vector search execution error:", err.message);
  } finally {
    await client.close();
  }
}

runVectorSearch();
