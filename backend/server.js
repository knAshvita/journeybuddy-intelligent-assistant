const express = require("express");
const cors = require("cors");
const dns = require("dns");
// Public DNS resolver to prevent Atlas SRV lookup failures
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection
const mongoUri = process.env.MONGODB_URI;
let dbClient = null;

if (mongoUri) {
  dbClient = new MongoClient(mongoUri);
  dbClient
    .connect()
    .then(() => console.log("🍃 MongoDB Atlas connected to Express Gateway."))
    .catch((err) => console.error("❌ MongoDB connection error:", err.message));
}

// Telemetry Middleware
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

// System Telemetry Route
app.get("/api/telemetry", (req, res) => {
  res.status(200).json({
    status: "online",
    service: "JourneyBuddy Express Gateway",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Live Vector Search Endpoint
app.post("/api/destinations/search", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    if (!dbClient) {
      return res.status(500).json({ error: "Database client not connected" });
    }

    const db = dbClient.db("journeybuddy");
    const collection = db.collection("destinations");

    // Dynamic Mock Vectorizer matching our 8D space:
    // Mountain queries weight dims 0 & 1; Beach queries weight dims 2 & 3; Cultural queries weight dims 4 & 5
    const qLower = query.toLowerCase();
    let queryVector = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];

    if (qLower.includes("snow") || qLower.includes("mountain") || qLower.includes("chalet") || qLower.includes("alps")) {
      queryVector = [0.85, 0.89, 0.08, 0.10, 0.01, 0.04, 0.12, 0.05];
    } else if (qLower.includes("beach") || qLower.includes("sea") || qLower.includes("island") || qLower.includes("goa") || qLower.includes("maldives")) {
      queryVector = [0.05, 0.07, 0.92, 0.88, 0.08, 0.04, 0.03, 0.12];
    } else if (qLower.includes("temple") || qLower.includes("culture") || qLower.includes("heritage") || qLower.includes("kyoto")) {
      queryVector = [0.10, 0.08, 0.04, 0.12, 0.90, 0.86, 0.05, 0.07];
    }

    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 10,
          limit: 2,
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          category: 1,
          price_usd: 1,
          description: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    res.status(200).json({
      query,
      results,
    });
  } catch (err) {
    console.error("Vector search failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🧭 JourneyBuddy Gateway running on http://localhost:${PORT}`);
});