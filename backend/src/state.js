const { EventEmitter } = require("events");
const { buildDevices } = require("./seed");

const events = new EventEmitter();
let devices = buildDevices();

function setStatus(id, status) {
  if (status !== "on" && status !== "off") return false;
  const device = devices.find((d) => d.id === id);
  if (!device || device.status === status) return false;

  device.status = status;
  device.lastChanged = new Date().toISOString();
  events.emit("change", { ...device });
  return true;
}

function getSnapshot() {
  return { devices: devices.map((d) => ({ ...d })) };
}

module.exports = { events, setStatus, getSnapshot };
