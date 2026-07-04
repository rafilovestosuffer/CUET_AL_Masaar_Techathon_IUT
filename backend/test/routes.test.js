const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const http = require("http");

const { router } = require("../src/routes");
const state = require("../src/state");

let base;
let server;

before(async () => {
  const app = express();
  app.use(express.json());
  app.use("/api", router);
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://localhost:${server.address().port}/api`;
});

after(() => server.close());

test("GET /devices returns the full 15-device snapshot", async () => {
  const res = await fetch(`${base}/devices`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.devices.length, 15);
  assert.equal(typeof body.totals.watts, "number");
  assert.ok(body.insights);
});

test("GET /usage returns power summary", async () => {
  const res = await fetch(`${base}/usage`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(typeof body.watts, "number");
  assert.ok(body.byRoom.work1 !== undefined);
});

test("GET /rooms/:name resolves a known room", async () => {
  const res = await fetch(`${base}/rooms/work2`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.room, "work2");
  assert.equal(body.devices.length, 5);
});

test("GET /rooms/:name rejects an unknown room with 404", async () => {
  const res = await fetch(`${base}/rooms/kitchen`);
  const body = await res.json();
  assert.equal(res.status, 404);
  assert.deepEqual(body.known, ["drawing", "work1", "work2"]);
});

test("GET /alerts returns active and recent arrays", async () => {
  const res = await fetch(`${base}/alerts`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(body.active));
  assert.ok(Array.isArray(body.recent));
});

test("GET /insights returns the boss-facing summary", async () => {
  const res = await fetch(`${base}/insights`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.ok(body.biggestRoom);
  assert.equal(typeof body.projectedMonthlyCost, "number");
});

test("POST /sim/scenario/:name applies a known scenario and mutates state", async () => {
  const res = await fetch(`${base}/sim/scenario/forgot-devices`, { method: "POST" });
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.deepEqual(body, { ok: true, scenario: "forgot-devices" });
  const work2 = state.getSnapshot().devices.filter((d) => d.room === "work2");
  assert.ok(work2.every((d) => d.status === "on"));
});

test("POST /sim/scenario/:name rejects an unknown scenario with 404", async () => {
  const res = await fetch(`${base}/sim/scenario/bogus`, { method: "POST" });
  const body = await res.json();
  assert.equal(res.status, 404);
  assert.deepEqual(body, { error: "unknown scenario" });
});
