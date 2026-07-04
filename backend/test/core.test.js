const { test } = require("node:test");
const assert = require("node:assert/strict");

const aggregate = require("../src/aggregate");
const insights = require("../src/insights");
const { matchRoom } = require("../src/routes");
const { numbersOk } = require("../../bot/src/humanize");

const DEVICES = [
  { id: "work2-fan-1", type: "fan", room: "work2", status: "on", watts: 65 },
  { id: "work2-fan-2", type: "fan", room: "work2", status: "on", watts: 72 },
  { id: "work1-light-1", type: "light", room: "work1", status: "on", watts: 15 },
  { id: "drawing-light-1", type: "light", room: "drawing", status: "off", watts: 15 },
];

test("computeTotals sums only on-devices, by room", () => {
  const { watts, byRoom } = aggregate.computeTotals(DEVICES);
  assert.equal(watts, 152);
  assert.deepEqual(byRoom, { drawing: 0, work1: 15, work2: 137 });
});

test("addEnergy integrates watt-seconds into kWh", () => {
  aggregate.resetKwh();
  aggregate.addEnergy(3_600_000, 1); // 3.6 MW for 1s = 1 kWh
  assert.equal(aggregate.getKwhToday(), 1);
});

test("wastedTaka converts Wh to BDT at the tariff", () => {
  assert.equal(aggregate.wastedTaka(1000), 8.95); // 1 kWh
  assert.equal(aggregate.wastedTaka(0), 0);
});

test("projectedCost scales watts over hours", () => {
  assert.equal(aggregate.projectedCost(1000, 24), 214.8); // 24 kWh × 8.95
});

test("insights picks the biggest-draw room and after-hours count", () => {
  const nightMs = new Date("2026-07-03T22:00:00").getTime();
  const out = insights.compute(DEVICES, nightMs, [{ wastedWh: 1000 }]);
  assert.equal(out.biggestRoom.room, "work2");
  assert.equal(out.biggestRoom.watts, 137);
  assert.equal(out.afterHoursOnCount, 3); // all on-devices count after hours
  assert.equal(out.wastedCostToday, 8.95);
});

test("insights reports zero after-hours during office hours", () => {
  const dayMs = new Date("2026-07-03T12:00:00").getTime();
  const out = insights.compute(DEVICES, dayMs, []);
  assert.equal(out.afterHoursOnCount, 0);
});

test("matchRoom fuzzy-resolves aliases and rejects garbage", () => {
  assert.equal(matchRoom("work 2"), "work2");
  assert.equal(matchRoom("workroom1"), "work1");
  assert.equal(matchRoom("Drawing"), "drawing");
  assert.equal(matchRoom("kitchen"), null);
});

test("numbersOk accepts matching numbers and rejects fabricated ones", () => {
  const facts = { watts: 182, costToday: 8.95 };
  assert.equal(numbersOk("Drawing 182 W, ৳8.95 today", facts), true);
  assert.equal(numbersOk("Actually it's 999 W", facts), false);
});

test("alerts fire once per condition and resolve when cleared", () => {
  const state = require("../src/state");
  const alerts = require("../src/alerts");
  const sim = require("../src/simulator");
  sim.setSimHour(22);
  for (const d of state.getSnapshot().devices) state.setStatus(d.id, d.room === "work2" ? "on" : "off");
  alerts.evaluate();
  alerts.evaluate();
  const active = alerts.getAlerts().active.filter((a) => a.room === "work2" && a.rule === "after-hours");
  assert.equal(active.length, 1, "one active after-hours alert, not one per tick");

  for (const d of state.getSnapshot().devices) state.setStatus(d.id, "off");
  alerts.evaluate();
  assert.equal(alerts.getAlerts().active.filter((a) => a.rule === "after-hours").length, 0, "resolves when cleared");
});
