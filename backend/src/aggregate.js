// Bangladesh commercial electricity tariff (BDT per kWh), used for cost estimates only.
const BDT_PER_KWH = 8.95;

const HISTORY_LIMIT = 60;

let kwhToday = 0;
const wattsHistory = [];

function computeTotals(devices) {
  const byRoom = { drawing: 0, work1: 0, work2: 0 };
  let watts = 0;
  for (const d of devices) {
    if (d.status === "on") {
      watts += d.watts;
      byRoom[d.room] += d.watts;
    }
  }
  return { watts, byRoom };
}

function addEnergy(watts, elapsedSeconds) {
  if (watts > 0 && elapsedSeconds > 0) {
    kwhToday += (watts * elapsedSeconds) / 3_600_000;
  }
}

function getKwhToday() {
  return Number(kwhToday.toFixed(3));
}

function getCostToday() {
  return Number((kwhToday * BDT_PER_KWH).toFixed(2));
}

function wastedWh(watts, elapsedSeconds) {
  if (watts <= 0 || elapsedSeconds <= 0) return 0;
  return Math.round((watts * elapsedSeconds) / 3600);
}

function wastedTaka(wattHours) {
  if (wattHours <= 0) return 0;
  return Number(((wattHours / 1000) * BDT_PER_KWH).toFixed(2));
}

// Cost of running `watts` continuously for `hours`, at the same tariff (BDT).
function projectedCost(watts, hours) {
  if (watts <= 0 || hours <= 0) return 0;
  return Number((((watts * hours) / 1000) * BDT_PER_KWH).toFixed(2));
}

function recordWatts(watts) {
  wattsHistory.push(watts);
  if (wattsHistory.length > HISTORY_LIMIT) wattsHistory.shift();
}

function getWattsHistory() {
  return wattsHistory.slice();
}

function resetKwh() {
  kwhToday = 0;
}

module.exports = {
  computeTotals,
  addEnergy,
  getKwhToday,
  getCostToday,
  wastedWh,
  wastedTaka,
  projectedCost,
  recordWatts,
  getWattsHistory,
  resetKwh,
};
