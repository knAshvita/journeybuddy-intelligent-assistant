const dns = require("dns");
// Force Node.js internal DNS resolver to use Google Public DNS for Atlas SRV lookups
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ Error: MONGODB_URI is not set in backend/.env");
  process.exit(1);
}

const client = new MongoClient(uri);

// Sample 8-dimensional normalized mock embeddings for destination concepts
const sampleDestinations = [
  {
    title: "Swiss Alps Alpine Sanctuary",
    author: "Elena Rostova",
    category: "mountain",
    tags: ["hiking", "luxury", "snow", "retreat"],
    description: "Serene escapes with mountain views, high alpine trails, and secluded chalets.",
    price_usd: 2500,
    timestamp: new Date("2026-09-12T00:00:00Z"),
    embedding: [0.88, 0.91, 0.05, 0.12, 0.02, 0.03, 0.15, 0.08]
  },
  {
    title: "Maldives Overwater Lagoon",
    author: "Kaito Tanaka",
    category: "beach",
    tags: ["ocean", "resort", "diving", "coral"],
    description: "Private oceanfront bungalows surrounded by crystal clear turquoise waters and marine life.",
    price_usd: 4200,
    timestamp: new Date("2026-09-12T00:00:00Z"),
    embedding: [0.04, 0.08, 0.95, 0.89, 0.10, 0.05, 0.02, 0.11]
  },
  {
    title: "Kyoto Heritage Sanctuary",
    author: "Kenji Sato",
    category: "culture",
    tags: ["temples", "zen", "gardens", "tradition"],
    description: "Historic temple walks, bamboo groves, and meditative tea ceremony pavilions.",
    price_usd: 1800,
    timestamp: new Date("2026-09-12T00:00:00Z"),
    embedding: [0.12, 0.09, 0.03, 0.15, 0.92, 0.88, 0.04, 0.06]
  }
];

async function run() {
  try {
    await client.connect();
    console.log(" Connected to MongoDB Atlas successfully.");

    const db = client.db("journeybuddy");
    const collection = db.collection("destinations");

    // Clean existing collection to avoid duplicate seed documents
    await collection.deleteMany({});

    // Insert unified documents (relational metadata + high-dimensional vector field)
    const result = await collection.insertMany(sampleDestinations);
    console.log(` Inserted ${result.insertedCount} unified destination documents with vector fields.`);

    // Display one document to verify the schema layout
    const sampleDoc = await collection.findOne({ category: "mountain" });
    console.log("\n Verified Unified Document Schema:");
    console.log(JSON.stringify(sampleDoc, null, 2));

  } catch (err) {
    console.error("❌ MongoDB connection or seeding failed:", err.message);
  } finally {
    await client.close();
  }
}

run();