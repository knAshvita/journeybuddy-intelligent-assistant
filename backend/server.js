const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Custom Telemetry Interceptor Middleware
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

// Telemetry & Health Status Endpoint
app.get("/api/telemetry", (req, res) => {
  res.status(200).json({
    status: "online",
    service: "JourneyBuddy Express Gateway",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Ingestion Endpoint for client queries
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

// Start Server
app.listen(PORT, () => {
  console.log(`🧭 JourneyBuddy Gateway running on http://localhost:${PORT}`);
});