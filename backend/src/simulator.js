const state = require("./state");
const aggregate = require("./aggregate");

const SIM_SPEED = Number(process.env.SIM_SPEED) || 1;
const TICK_MS = 5000;
const ADJUST_CHANCE = 0.4;

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

function setSimTime(ms) {
  simBaseMs = ms;
  simStartReal = Date.now();
  lastSimMs = getSimMs();
}

function setSimHour(hour) {
  const base = new Date();
  base.setHours(hour, 0, 0, 0);
  setSimTime(base.getTime());
}

function workProb(th) {
  if (th < 8.75) return 0.02;
  if (th < 9.25) return 0.1 + 0.8 * ((th - 8.75) / 0.5);
  if (th < 12) return 0.9;
  if (th < 13) return 0.55;
  if (th < 17) return 0.9;
  if (th < 18) return 0.9 - 0.8 * (th - 17);
  return 0.03;
}

function drawingProb(th) {
  return th >= 9 && th < 18 ? 0.25 : 0.05;
}

function targetProb(device, th) {
  return device.room === "drawing" ? drawingProb(th) : workProb(th);
}

function decimalHour(ms) {
  const d = new Date(ms);
  return d.getHours() + d.getMinutes() / 60;
}

function applySchedule(smooth) {
  const scenarios = require("./scenarios");
  const pins = scenarios.getPins();
  const th = decimalHour(getSimMs());

  for (const device of state.getSnapshot().devices) {
    if (pins.has(device.id)) {
      if (device.status !== pins.get(device.id)) state.setStatus(device.id, pins.get(device.id));
      continue;
    }
    const desiredOn = Math.random() < targetProb(device, th);
    if (desiredOn !== (device.status === "on")) {
      if (!smooth || Math.random() < ADJUST_CHANCE) {
        state.setStatus(device.id, desiredOn ? "on" : "off");
      }
    }
  }
}

function tick() {
  const simNow = getSimMs();
  aggregate.addEnergy(aggregate.computeTotals(state.getSnapshot().devices).watts, (simNow - lastSimMs) / 1000);
  lastSimMs = simNow;
  applySchedule(true);
}

function start() {
  if (process.env.SIM_HOUR !== undefined) {
    setSimHour(Number(process.env.SIM_HOUR));
  } else {
    setSimTime(Date.now());
  }
  applySchedule(false);
  timer = setInterval(tick, TICK_MS);
}

module.exports = { start, getSimMs, getSimTime, setSimTime, setSimHour, SIM_SPEED };
