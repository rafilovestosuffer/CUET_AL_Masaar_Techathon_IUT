const LABELS = { drawing: "Drawing Room", work1: "Work Room 1", work2: "Work Room 2" };
const ROOMS = ["drawing", "work1", "work2"];

function statusReply(data) {
  const { devices, totals, kwhToday } = data;
  const onCount = devices.filter((d) => d.status === "on").length;
  const parts = ROOMS.map((room) => {
    const roomDevices = devices.filter((d) => d.room === room);
    const on = roomDevices.filter((d) => d.status === "on").length;
    return `${LABELS[room]} ${on}/${roomDevices.length}`;
  });
  return `🏢 Office status — ${onCount}/${devices.length} devices on, ${totals.watts} W total (~${kwhToday} kWh today).\n${parts.join(" · ")}.`;
}

function roomReply(data) {
  const label = LABELS[data.room] || data.room;
  const on = data.devices.filter((d) => d.status === "on");
  const names = on.map((d) => d.label).join(", ") || "none";
  return `💡 ${label} — ${on.length}/${data.devices.length} on, ${data.watts} W.\nOn: ${names}.`;
}

function usageReply(data) {
  return `⚡ The office is drawing ${data.watts} W right now (~${data.kwhToday} kWh, ৳${data.costToday} today).\nBy room — Drawing ${data.byRoom.drawing} W · Work 1 ${data.byRoom.work1} W · Work 2 ${data.byRoom.work2} W.`;
}

function statusFacts(data) {
  const { devices, totals, kwhToday } = data;
  return {
    devicesOn: devices.filter((d) => d.status === "on").length,
    devicesTotal: devices.length,
    watts: totals.watts,
    kwhToday,
    rooms: ROOMS.map((room) => {
      const rd = devices.filter((d) => d.room === room);
      return { room: LABELS[room], on: rd.filter((d) => d.status === "on").length, total: rd.length };
    }),
  };
}

function usageFacts(data) {
  return { watts: data.watts, kwhToday: data.kwhToday, costToday: data.costToday, byRoom: data.byRoom };
}

function roomFacts(data) {
  const on = data.devices.filter((d) => d.status === "on");
  return {
    room: LABELS[data.room] || data.room,
    on: on.length,
    total: data.devices.length,
    watts: data.watts,
    onDevices: on.map((d) => d.label),
  };
}

function alertReply(alert) {
  const wasted = alert.wastedWh > 0 ? ` About ${alert.wastedWh} Wh wasted so far.` : "";
  return `⚠️ ${alert.message}${wasted}`;
}

function alertFacts(alert) {
  return {
    room: LABELS[alert.room] || alert.room,
    rule: alert.rule,
    message: alert.message,
    wastedWh: alert.wastedWh || 0,
  };
}

function backendDownReply() {
  return "I can't reach the office sensors right now — try again in a minute.";
}

function unknownRoomReply() {
  return `I don't know that room. Try: ${ROOMS.join(", ")}.`;
}

function helpReply() {
  return [
    "🤖 **OfficePulse** — I watch the office lights & fans.",
    "`!status` — every room at a glance",
    "`!room <name>` — one room (e.g. `!room work2`)",
    "`!usage` — power, energy & cost today",
    "`!ask <question>` — ask me anything, e.g. `!ask which room wastes the most?`",
  ].join("\n");
}

module.exports = {
  statusReply,
  roomReply,
  usageReply,
  alertReply,
  statusFacts,
  usageFacts,
  roomFacts,
  alertFacts,
  backendDownReply,
  unknownRoomReply,
  helpReply,
};
