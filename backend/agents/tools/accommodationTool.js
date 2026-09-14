async function accommodationTool(destination, maxPriceInr = 3000) {
  const lodgings = [
    {
      title: "Coastal Breeze Residency",
      destination: "Karkala",
      pricePerNightInr: 1400,
      category: "Lodge",
      amenities: ["Clean Bath", "Wi-Fi", "Parking"],
      source: "verified_partner",
    },
    {
      title: "Surathkal Comfort Guest House",
      destination: "Karkala",
      pricePerNightInr: 1200,
      category: "Budget Guest House",
      amenities: ["24/7 Water", "AC Available"],
      source: "verified_partner",
    },
    {
      title: "Suvadha Heritage Homestay",
      destination: "Karkala",
      pricePerNightInr: 2000,
      category: "Homestay",
      amenities: ["Local Cuisine", "Nature Trails"],
      source: "verified_partner",
    },
    {
      title: "Portview Express Inn",
      destination: "Karkala",
      pricePerNightInr: 1100,
      category: "Transit Lodge",
      amenities: ["Budget Double", "Near Bus Stand"],
      source: "verified_partner",
    },
  ];

  const matched = lodgings.filter(
    (l) =>
      l.destination.toLowerCase() === destination.toLowerCase() &&
      l.pricePerNightInr <= maxPriceInr
  );

  return {
    success: true,
    count: matched.length,
    accommodations: matched,
  };
}

module.exports = { accommodationTool };