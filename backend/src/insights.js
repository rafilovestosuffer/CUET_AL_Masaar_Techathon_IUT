const aggregate = require("./aggregate");

const LABELS = { drawing: "Drawing Room", work1: "Work Room 1", work2: "Work Room 2" };
const OPEN_HOUR = 9;
const CLOSE_HOUR = 17;

// Boss-facing intelligence derived purely from the live snapshot. No new numbers are
// invented here — everything is a straight function of device state and the tariff.
function compute(devices, simMs, activeAlerts = []) {
  const { watts, byRoom } = aggregate.computeTotals(devices);
  const hour = new Date(simMs).getHours();
  const afterHours = hour < OPEN_HOUR || hour >= CLOSE_HOUR;

  let biggest = { room: null, label: "None", watts: 0 };
  for (const room of Object.keys(byRoom)) {
    if (byRoom[room] > biggest.watts) {
      biggest = { room, label: LABELS[room], watts: byRoom[room] };
    }
  }

  const afterHoursOnCount = afterHours ? devices.filter((d) => d.status === "on").length : 0;
  const wastedCostToday = Number(
    activeAlerts.reduce((sum, a) => sum + aggregate.wastedTaka(a.wastedWh || 0), 0).toFixed(2)
  );

  return {
    biggestRoom: biggest,
    afterHoursOnCount,
    costToday: aggregate.getCostToday(),
    projectedDailyCost: aggregate.projectedCost(watts, 24),
    projectedMonthlyCost: Number((aggregate.projectedCost(watts, 24) * 30).toFixed(2)),
    wastedCostToday,
  };
}

module.exports = { compute };
