function transportTool(origin = "Regional Hub", destination = "Karkala", transportType = "Bus", members = 1) {
  const baseRatePerPerson = transportType.toLowerCase() === "car" ? 450 : 180;
  const transitCost = baseRatePerPerson * members;

  return {
    success: true,
    route: `${origin} -> ${destination}`,
    transportType,
    travelers: members,
    ratePerPersonInr: baseRatePerPerson,
    estimatedTotalTransitInr: transitCost,
    bookingNotice: "Transit tickets require redirection to transport operators.",
    bookingUrl: `https://www.redbus.in/bus-tickets/${encodeURIComponent(destination)}`,
  };
}

module.exports = { transportTool };