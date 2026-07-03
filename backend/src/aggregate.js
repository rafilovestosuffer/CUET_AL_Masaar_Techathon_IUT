let kwhToday = 0;

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

function resetKwh() {
  kwhToday = 0;
}

module.exports = { computeTotals, addEnergy, getKwhToday, resetKwh };
