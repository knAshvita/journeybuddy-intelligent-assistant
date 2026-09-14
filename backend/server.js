const express = require("express");
const cors = require("cors");
const dns = require("dns");

try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {
  console.warn("⚠️ DNS resolver warning:", e.message);
}

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { MongoClient, ObjectId } = require("mongodb");
const { Pinecone } = require("@pinecone-database/pinecone");
const { verifyToken } = require("./middleware/authMiddleware");
const { generateTravelPlan } = require("./langchain/ragPipeline");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Initialize MongoDB Atlas Client
const mongoUri = process.env.MONGODB_URI;
let dbClient = null;

if (mongoUri) {
  dbClient = new MongoClient(mongoUri, {
    family: 4,
    serverSelectionTimeoutMS: 8000,
  });
  dbClient
    .connect()
    .then(() => console.log("🍃 MongoDB Atlas connected to Express Gateway."))
    .catch((err) => console.error("❌ MongoDB connection error:", err.message));
}

// 2. Initialize Pinecone Client
const pineconeApiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX || "journeybuddy-destinations";
let pineconeIndex = null;

if (pineconeApiKey) {
  try {
    const pc = new Pinecone({ apiKey: pineconeApiKey });
    pineconeIndex = pc.index(indexName);
    console.log(`🌲 Pinecone Index "${indexName}" connected to Express Gateway.`);
  } catch (err) {
    console.error("❌ Pinecone init error:", err.message);
  }
}

// 3. Telemetry Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[TELEMETRY] ${timestamp} | ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms`
    );
  });

  next();
});

// 4. System Telemetry & Health Route
app.get("/api/telemetry", (req, res) => {
  res.status(200).json({
    status: "online",
    service: "JourneyBuddy Express Gateway",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 5. Query Ingestion Route
app.post("/api/query", (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query payload is required" });
  }

  res.status(200).json({
    message: "Query accepted by gateway",
    stagedQuery: query,
    receivedAt: new Date().toISOString(),
  });
});

// 6. Protected User Profile Route
app.get("/api/user/profile", verifyToken, (req, res) => {
  res.status(200).json({
    message: "Authorized secure access granted.",
    user: {
      uid: req.user.uid,
      email: req.user.email,
      role: req.user.email?.includes("admin") ? "admin" : "traveler",
    },
  });
});

// Helper: 8-Dimensional Dynamic Vectorizer
function vectorizeQuery(query) {
  const q = query.toLowerCase();
  if (q.includes("snow") || q.includes("mountain") || q.includes("chalet") || q.includes("alps")) {
    return [0.85, 0.89, 0.08, 0.10, 0.01, 0.04, 0.12, 0.05];
  } else if (q.includes("beach") || q.includes("sea") || q.includes("island") || q.includes("lagoon") || q.includes("maldives")) {
    return [0.04, 0.08, 0.95, 0.89, 0.10, 0.05, 0.02, 0.11];
  } else if (q.includes("temple") || q.includes("culture") || q.includes("heritage") || q.includes("karkala")) {
    return [0.10, 0.08, 0.04, 0.12, 0.92, 0.88, 0.04, 0.06];
  }
  return [0.15, 0.20, 0.25, 0.18, 0.22, 0.19, 0.14, 0.16];
}

// 7. Hybrid Destination Search Endpoint (Pinecone -> MongoDB)
app.post("/api/destinations/search", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    if (!dbClient || !pineconeIndex) {
      return res.status(500).json({ error: "Database or Vector subsystems not connected" });
    }

    const db = dbClient.db("journeybuddy");
    const queryVector = vectorizeQuery(query);
    const SIMILARITY_THRESHOLD = 0.70;

    const pineconeResponse = await pineconeIndex.query({
      vector: queryVector,
      topK: 10,
      includeMetadata: true,
    });

    const matches = pineconeResponse.matches || [];
    const validMatches = matches.filter((m) => m.score >= SIMILARITY_THRESHOLD);
    const docIds = validMatches
      .map((m) => {
        try {
          return new ObjectId(m.id);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const mongoDocs = await db.collection("destinations").find({ _id: { $in: docIds } }).toArray();

    const results = validMatches.map((m) => {
      const fullDoc = mongoDocs.find((d) => d._id.toString() === m.id);
      return {
        title: fullDoc?.title || m.metadata?.title,
        category: fullDoc?.category || m.metadata?.category,
        price_usd: fullDoc?.price_usd || m.metadata?.price_usd,
        description: fullDoc?.description || "Curated destination discovery.",
        score: m.score,
        source: "pinecone_internal_knowledge",
      };
    });

    res.status(200).json({ query, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Module 2.10: LangChain Hybrid RAG Orchestration Endpoint (Chat & Destination-Aware)
const { generateChatbotResponse } = require("./langchain/ragPipeline");

app.post("/api/chat/rag", async (req, res) => {
  const {
    query = "",
    destination = "",
    history = [],
    travelContext = {},
    targetCount = 10,
  } = req.body;

  if (!query && !destination) {
    return res.status(400).json({ error: "A query or destination parameter is required." });
  }

  try {
    console.log(`🤖 [Express Gateway] Routing to LangChain RAG -> Query: "${query}" | Dest: "${destination}"`);
    
    const result = await generateChatbotResponse({
      query,
      destination,
      history,
      travelContext,
      targetCount: Number(targetCount) || 10,
    });

    return res.status(200).json({
      success: true,
      query,
      destination: result.destination,
      answer: result.answer,
      places: result.places,
      bookingLink: result.bookingLink,
      travelContext: result.travelContext,
      sources: result.sources,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ LangChain RAG pipeline failed:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Server Listener
app.listen(PORT, () => {
  console.log(`🧭 JourneyBuddy Gateway running on http://localhost:${PORT}`);
});
