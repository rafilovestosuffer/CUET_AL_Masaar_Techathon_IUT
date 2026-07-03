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
  return `⚡ The office is drawing ${data.watts} W right now (~${data.kwhToday} kWh today).\nBy room — Drawing ${data.byRoom.drawing} W · Work 1 ${data.byRoom.work1} W · Work 2 ${data.byRoom.work2} W.`;
}

function backendDownReply() {
  return "I can't reach the office sensors right now — try again in a minute.";
}

function unknownRoomReply() {
  return `I don't know that room. Try: ${ROOMS.join(", ")}.`;
}

module.exports = { statusReply, roomReply, usageReply, backendDownReply, unknownRoomReply };
