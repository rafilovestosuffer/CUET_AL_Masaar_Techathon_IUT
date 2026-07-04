const express = require("express");
const state = require("./state");
const aggregate = require("./aggregate");
const sim = require("./simulator");
const alerts = require("./alerts");
const scenarios = require("./scenarios");
const { ROOMS } = require("./seed");

function matchRoom(name) {
  const n = String(name).toLowerCase().replace(/[^a-z0-9]/g, "");
  if (n.includes("draw")) return "drawing";
  if (n.includes("1")) return "work1";
  if (n.includes("2")) return "work2";
  return null;
}

function buildDevicesResponse() {
  const { devices } = state.getSnapshot();
  const { watts, byRoom } = aggregate.computeTotals(devices);
  return {
    devices,
    totals: { watts, byRoom },
    kwhToday: aggregate.getKwhToday(),
    costToday: aggregate.getCostToday(),
    wattsHistory: aggregate.getWattsHistory(),
    simTime: sim.getSimTime(),
  };
}

function buildUsage() {
  const { devices } = state.getSnapshot();
  const { watts, byRoom } = aggregate.computeTotals(devices);
  return {
    watts,
    byRoom,
    kwhToday: aggregate.getKwhToday(),
    costToday: aggregate.getCostToday(),
    simTime: sim.getSimTime(),
  };
}

const router = express.Router();

router.get("/devices", (_req, res) => res.json(buildDevicesResponse()));

router.get("/usage", (_req, res) => res.json(buildUsage()));

router.get("/rooms/:name", (req, res) => {
  const room = matchRoom(req.params.name);
  if (!room) return res.status(404).json({ error: "unknown room", known: ROOMS });
  const { devices } = state.getSnapshot();
  const { byRoom } = aggregate.computeTotals(devices);
  res.json({
    room,
    devices: devices.filter((d) => d.room === room),
    watts: byRoom[room],
  });
});

router.get("/alerts", (_req, res) => res.json(alerts.getAlerts()));

router.post("/sim/scenario/:name", (req, res) => {
  const { name } = req.params;
  if (!scenarios.applyScenario(name)) {
    return res.status(404).json({ error: "unknown scenario" });
  }
  alerts.evaluate();
  res.json({ ok: true, scenario: name });
});

module.exports = { router, buildDevicesResponse };
