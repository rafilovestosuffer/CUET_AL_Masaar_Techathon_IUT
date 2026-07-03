const { EventEmitter } = require("events");
const state = require("./state");
const sim = require("./simulator");

const events = new EventEmitter();

const ROOMS = ["drawing", "work1", "work2"];
const LABELS = { drawing: "Drawing Room", work1: "Work Room 1", work2: "Work Room 2" };
const CHECK_MS = 30000;
const OPEN_HOUR = 9;
const CLOSE_HOUR = 17;
const CONTINUOUS_HOURS = 2;
const RECENT_LIMIT = 20;

const active = new Map();
const recent = [];
const fullOnSince = {};
let seq = 0;
let timer = null;

function fire(key, rule, room, message) {
  if (active.has(key)) return;
  const alert = {
    id: `a-${++seq}`,
    rule,
    room,
    message,
    createdAt: sim.getSimTime(),
    active: true,
  };
  active.set(key, alert);
  recent.unshift(alert);
  if (recent.length > RECENT_LIMIT) recent.pop();
  events.emit("new", alert);
}

function evaluate() {
  const { devices } = state.getSnapshot();
  const simMs = sim.getSimMs();
  const hour = new Date(simMs).getHours();
  const afterHours = hour < OPEN_HOUR || hour >= CLOSE_HOUR;
  const live = new Set();

  for (const room of ROOMS) {
    const roomDevices = devices.filter((d) => d.room === room);
    const onCount = roomDevices.filter((d) => d.status === "on").length;

    if (afterHours && onCount > 0) {
      const key = `after-hours:${room}`;
      live.add(key);
      fire(key, "after-hours", room, `${LABELS[room]} has ${onCount} device${onCount > 1 ? "s" : ""} on after hours.`);
    }

    const allOn = roomDevices.length > 0 && onCount === roomDevices.length;
    if (allOn) {
      if (!fullOnSince[room]) fullOnSince[room] = simMs;
      if ((simMs - fullOnSince[room]) / 3_600_000 > CONTINUOUS_HOURS) {
        const key = `2h-continuous:${room}`;
        live.add(key);
        fire(key, "2h-continuous", room, `${LABELS[room]} has been fully on for over ${CONTINUOUS_HOURS} hours.`);
      }
    } else {
      fullOnSince[room] = null;
    }
  }

  for (const key of [...active.keys()]) {
    if (!live.has(key)) {
      active.get(key).active = false;
      active.delete(key);
    }
  }
}

function getAlerts() {
  return { active: [...active.values()], recent: recent.slice() };
}

function start() {
  evaluate();
  timer = setInterval(evaluate, CHECK_MS);
}

module.exports = { events, start, evaluate, getAlerts };
