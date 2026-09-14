function budgetTool({
  members = 1,
  days = 1,
  userBudgetInr = 15000,
  roomNightRateInr = 1400,
  transportCostTotalInr = 1200,
  activitiesCostPerPersonInr = 300,
  dailyFoodPerPersonInr = 400,
}) {
  const requiredRooms = Math.ceil(members / 2);
  const totalNights = Math.max(days - 1, 0);

  const totalAccommodationInr = requiredRooms * roomNightRateInr * (totalNights === 0 ? 0 : totalNights);
  const totalFoodInr = members * dailyFoodPerPersonInr * days;
  const totalActivitiesInr = members * activitiesCostPerPersonInr;
  const grandTotalInr = totalAccommodationInr + totalFoodInr + totalActivitiesInr + transportCostTotalInr;

  const isWithinBudget = grandTotalInr <= userBudgetInr;
  const remainingBudgetInr = userBudgetInr - grandTotalInr;

  return {
    success: true,
    breakdown: {
      travelers: members,
      durationDays: days,
      nightsStayed: totalNights,
      roomsAllocated: requiredRooms,
      itemizedInr: {
        accommodation: totalAccommodationInr,
        transport: transportCostTotalInr,
        food: totalFoodInr,
        activities: totalActivitiesInr,
      },
      grandTotalInr,
      userBudgetInr,
      isWithinBudget,
      remainingBudgetInr,
    },
  };
}

module.exports = { budgetTool };