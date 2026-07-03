const state = require("./state");

const pins = new Map();

function pinRoom(room, status) {
  for (const d of state.getSnapshot().devices) {
    if (d.room === room) {
      state.setStatus(d.id, status);
      pins.set(d.id, status);
    }
  }
}

function applyScenario(name) {
  const sim = require("./simulator");

  switch (name) {
    case "forgot-devices":
      pins.clear();
      pinRoom("work2", "on");
      sim.setSimHour(22);
      return true;

    case "all-off":
      pins.clear();
      for (const d of state.getSnapshot().devices) {
        state.setStatus(d.id, "off");
        pins.set(d.id, "off");
      }
      return true;

    case "business-hours":
      pins.clear();
      sim.setSimHour(12);
      for (const d of state.getSnapshot().devices) {
        if (d.room !== "drawing") state.setStatus(d.id, "on");
      }
      return true;

    case "reset":
      pins.clear();
      sim.setSimTime(Date.now());
      return true;

    default:
      return false;
  }
}

function getPins() {
  return pins;
}

module.exports = { applyScenario, getPins };
