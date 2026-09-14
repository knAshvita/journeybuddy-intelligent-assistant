const { getHybridContext } = require("./langchain/retriever");

async function test() {
  console.log("=========================================");
  console.log("⚡ TEST: Hybrid Retrieval for Mangalore (10 places)");
  console.log("=========================================");

  const results = await getHybridContext("10 places to visit in Mangalore", 10);

  console.log(`\n✅ Retrieved Total: ${results.length} places.`);
  console.table(
    results.map((r, i) => ({
      "#": i + 1,
      Title: r.title,
      Category: r.category,
      Source: r.source,
    }))
  );
}

test();