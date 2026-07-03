const ROOMS = ["drawing", "work1", "work2"];

const FAN_WATTS = { "fan-1": 65, "fan-2": 72 };
const LIGHT_WATTS = { "light-1": 15, "light-2": 12, "light-3": 18 };

function buildDevices() {
  const now = new Date().toISOString();
  const devices = [];

  for (const room of ROOMS) {
    for (const [key, watts] of Object.entries(FAN_WATTS)) {
      const n = key.split("-")[1];
      devices.push({
        id: `${room}-${key}`,
        type: "fan",
        room,
        label: `Fan ${n}`,
        status: "off",
        watts,
        lastChanged: now,
      });
    }
    for (const [key, watts] of Object.entries(LIGHT_WATTS)) {
      const n = key.split("-")[1];
      devices.push({
        id: `${room}-${key}`,
        type: "light",
        room,
        label: `Light ${n}`,
        status: "off",
        watts,
        lastChanged: now,
      });
    }
  }

  return devices;
}

module.exports = { ROOMS, buildDevices };
