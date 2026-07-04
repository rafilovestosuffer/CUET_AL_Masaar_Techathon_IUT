const { test } = require("node:test");
const assert = require("node:assert/strict");

const api = require("../src/api");
const { handleCommand, matchRoom } = require("../src/commands");

const USAGE_FACTS = {
  watts: 182,
  byRoom: { drawing: 0, work1: 0, work2: 182 },
  kwhToday: 0.5,
  costToday: 4.48,
  insights: { projectedMonthlyCost: 1591.8 },
};

test("matchRoom fuzzy-resolves room aliases", () => {
  assert.equal(matchRoom("work2"), "work2");
  assert.equal(matchRoom("workroom2"), "work2");
  assert.equal(matchRoom("work 2"), "work2");
  assert.equal(matchRoom("drawing"), "drawing");
  assert.equal(matchRoom("kitchen"), null);
});

test("!usage reports watts, kWh and cost from backend facts", async (t) => {
  t.mock.method(api, "getUsage", async () => USAGE_FACTS);
  const reply = await handleCommand("!usage");
  assert.match(reply, /182 W/);
  assert.match(reply, /৳4\.48/);
});

test("!cost reports today's bill and monthly projection", async (t) => {
  t.mock.method(api, "getUsage", async () => USAGE_FACTS);
  const reply = await handleCommand("!cost");
  assert.match(reply, /৳4\.48/);
  assert.match(reply, /1591\.8/);
});

test("!room resolves a fuzzy name and lists devices", async (t) => {
  t.mock.method(api, "getRoom", async () => ({
    status: 200,
    data: { room: "work2", devices: [{ label: "Fan 1", status: "on" }], watts: 65 },
  }));
  const reply = await handleCommand("!room work 2");
  assert.match(reply, /Work Room 2/);
  assert.match(reply, /65 W/);
});

test("!room rejects an unknown room name", async () => {
  const reply = await handleCommand("!room kitchen");
  assert.match(reply, /don't know that room/);
});

test("!demo triggers a whitelisted scenario", async (t) => {
  t.mock.method(api, "triggerScenario", async (name) => ({ status: 200, data: { ok: true, scenario: name } }));
  const reply = await handleCommand("!demo forgot-devices");
  assert.match(reply, /forgot-devices/);
});

test("!demo rejects a non-whitelisted scenario without calling the backend", async (t) => {
  const trigger = t.mock.method(api, "triggerScenario", async () => ({ status: 200, data: {} }));
  const reply = await handleCommand("!demo turn-off-all-lights");
  assert.match(reply, /don't know that scenario/);
  assert.equal(trigger.mock.callCount(), 0);
});

test("backend failure falls back to a polite error reply", async (t) => {
  t.mock.method(api, "getUsage", async () => {
    throw new Error("network error");
  });
  const reply = await handleCommand("!usage");
  assert.match(reply, /can't reach the office sensors/);
});

test("an unrecognized command returns null", async () => {
  assert.equal(await handleCommand("!bogus"), null);
  assert.equal(await handleCommand("just chatting"), null);
});
