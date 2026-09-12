const dns = require("dns");
// Force Node.js internal resolver to use Google Public DNS for Atlas SRV lookups
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const { MongoClient } = require("mongodb");
const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

const mongoUri = process.env.MONGODB_URI;
const pineconeApiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX || "journeybuddy-destinations";

if (!mongoUri || !pineconeApiKey) {
  console.error("❌ Missing MONGODB_URI or PINECONE_API_KEY in backend/.env");
  process.exit(1);
}

const mongoClient = new MongoClient(mongoUri);
const pc = new Pinecone({ apiKey: pineconeApiKey });

async function sync() {
  try {
    // 1. Connect to Pinecone Index
    console.log(`🌲 Connecting to Pinecone index: "${indexName}"...`);
    const pineconeIndex = pc.index(indexName);

    // 2. Fetch Destinations from MongoDB
    await mongoClient.connect();
    console.log("🍃 Connected to MongoDB Atlas.");
    const db = mongoClient.db("journeybuddy");
    const destinations = await db.collection("destinations").find({}).toArray();

    if (!destinations || destinations.length === 0) {
      console.log("⚠️ No records found in MongoDB. Run node seedDestinations.js first.");
      return;
    }

    console.log(`📦 Found ${destinations.length} records in MongoDB. Preparing Pinecone upsert...`);

    // 3. Transform to Pinecone Vector Records
    const vectors = destinations
      .filter((doc) => Array.isArray(doc.embedding) && doc.embedding.length === 8)
      .map((doc) => ({
        id: doc._id.toString(),
        values: doc.embedding,
        metadata: {
          title: doc.title || "",
          category: doc.category || "",
          price_usd: Number(doc.price_usd) || 0,
          author: doc.author || "",
        },
      }));

    if (vectors.length === 0) {
      console.error("❌ No valid 8-dimensional vector documents found to upsert.");
      return;
    }

    // 4. Upsert into Pinecone (supports both SDK signature formats)
    try {
      await pineconeIndex.upsert(vectors);
    } catch {
      await pineconeIndex.upsert({ records: vectors });
    }

    console.log(`🚀 Successfully upserted ${vectors.length} vectors into Pinecone index "${indexName}"!`);

    // 5. Verify Index Statistics
    console.log("⏳ Fetching updated Pinecone stats...");
    const stats = await pineconeIndex.describeIndexStats();
    console.log("\n📊 Pinecone Index Stats:", JSON.stringify(stats, null, 2));

  } catch (err) {
    console.error("❌ Sync failed:", err.message);
  } finally {
    await mongoClient.close();
  }
}

sync();