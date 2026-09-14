const { getHybridContext } = require("../../langchain/retriever");

async function destinationSearchTool(query, destination, count = 5) {
  const searchTerm = destination ? `${destination} ${query}` : query;
  try {
    const rawPlaces = await getHybridContext(searchTerm, count);
    const validPlaces = (rawPlaces || []).filter(
      (p) =>
        p &&
        p.title &&
        !/Cultural Point|Point \d|Landmark \d/i.test(p.title)
    );

    return {
      success: true,
      count: validPlaces.length,
      places: validPlaces.map((p) => ({
        title: p.title,
        category: p.category || "attraction",
        price_usd: Number(p.price_usd) || 10,
        description: p.description || "Verified destination landmark.",
        source: p.source || "internal_knowledge",
      })),
    };
  } catch (err) {
    return {
      success: false,
      count: 0,
      places: [],
      error: err.message,
    };
  }
}

module.exports = { destinationSearchTool };