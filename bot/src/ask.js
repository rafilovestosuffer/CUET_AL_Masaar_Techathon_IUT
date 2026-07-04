const api = require("./api");
const t = require("./templates");
const { answer } = require("./humanize");

const LABELS = { drawing: "Drawing Room", work1: "Work Room 1", work2: "Work Room 2" };
const ROOMS = ["drawing", "work1", "work2"];

// A comprehensive, backend-computed facts object so any legitimate number the user asks
// about already exists in facts — the number-integrity check can then reject fabrications.
function buildFacts(data) {
  const { devices, totals, kwhToday, costToday, insights } = data;
  return {
    totalWatts: totals.watts,
    devicesOn: devices.filter((d) => d.status === "on").length,
    devicesTotal: devices.length,
    kwhToday,
    costToday,
    byRoom: ROOMS.map((room) => {
      const rd = devices.filter((d) => d.room === room);
      return {
        room: LABELS[room],
        watts: totals.byRoom[room],
        on: rd.filter((d) => d.status === "on").length,
        total: rd.length,
      };
    }),
    biggestDrawRoom: insights.biggestRoom.label,
    biggestDrawWatts: insights.biggestRoom.watts,
    projectedDailyCost: insights.projectedDailyCost,
    projectedMonthlyCost: insights.projectedMonthlyCost,
    wastedCostToday: insights.wastedCostToday,
    devicesOnAfterHours: insights.afterHoursOnCount,
  };
}

// Deterministic answer used whenever the LLM is off, unavailable, or fails the number check.
function fallbackReply(data) {
  const { insights } = data;
  const money =
    insights.wastedCostToday > 0
      ? ` ${insights.biggestRoom.label} is the biggest draw and ৳${insights.wastedCostToday} has been wasted today.`
      : ` ${insights.biggestRoom.label} is the biggest draw right now.`;
  return `${t.statusReply(data)}${money}\nAsk me things like "which room wastes the most?" — or use !status, !room, !usage.`;
}

async function handleAsk(question) {
  const data = await api.getDevices();
  return answer(question, buildFacts(data), fallbackReply(data));
}

module.exports = { handleAsk, buildFacts };
