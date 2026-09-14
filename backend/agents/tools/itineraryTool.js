function itineraryTool(destination, days, places) {
  const dayPlan = [];
  const cleanPlaces = Array.isArray(places) && places.length > 0
    ? places
    : [
        { title: `${destination} Central Heritage Walk`, category: "heritage" },
        { title: `${destination} Lake & Viewpoint`, category: "nature" },
        { title: `${destination} Local Artisans Market`, category: "culture" },
      ];

  let placeIdx = 0;
  for (let d = 1; d <= days; d++) {
    const morningPlace = cleanPlaces[placeIdx % cleanPlaces.length];
    placeIdx++;
    const afternoonPlace = cleanPlaces[placeIdx % cleanPlaces.length];
    placeIdx++;

    dayPlan.push({
      day: d,
      morning: `Visit ${morningPlace.title} (${morningPlace.category})`,
      afternoon: `Explore ${afternoonPlace.title} (${afternoonPlace.category})`,
      evening: d === days ? "Departure & Return Travel" : "Local Dinner & Leisure",
    });
  }

  return {
    success: true,
    destination,
    durationDays: days,
    schedule: dayPlan,
  };
}

module.exports = { itineraryTool };