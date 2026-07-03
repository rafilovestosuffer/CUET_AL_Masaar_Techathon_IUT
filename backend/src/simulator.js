const state = require("./state");
const aggregate = require("./aggregate");

const SIM_SPEED = Number(process.env.SIM_SPEED) || 1;
const TICK_MS = 5000;
const FLIP_CHANCE = 0.15;

let simBaseMs = 0;
let simStartReal = 0;
let lastSimMs = 0;
let timer = null;

function getSimMs() {
  return simBaseMs + (Date.now() - simStartReal) * SIM_SPEED;
}

function getSimTime() {
  return new Date(getSimMs()).toISOString();
}

function seedInitial() {
  for (const d of state.getSnapshot().devices) {
    if (Math.random() < 0.5) state.setStatus(d.id, "on");
  }
}

function tick() {
  const simNow = getSimMs();
  const elapsedSeconds = (simNow - lastSimMs) / 1000;
  lastSimMs = simNow;

  const { watts } = aggregate.computeTotals(state.getSnapshot().devices);
  aggregate.addEnergy(watts, elapsedSeconds);

  for (const d of state.getSnapshot().devices) {
    if (Math.random() < FLIP_CHANCE) {
      state.setStatus(d.id, d.status === "on" ? "off" : "on");
    }
  }
}

function start() {
  simStartReal = Date.now();
  simBaseMs = Date.now();
  lastSimMs = getSimMs();
  seedInitial();
  timer = setInterval(tick, TICK_MS);
}

module.exports = { start, getSimMs, getSimTime, SIM_SPEED };
