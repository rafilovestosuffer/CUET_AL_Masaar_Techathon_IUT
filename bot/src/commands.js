const api = require("./api");
const t = require("./templates");

function matchRoom(name) {
  const n = String(name).toLowerCase().replace(/[^a-z0-9]/g, "");
  if (n.includes("draw")) return "drawing";
  if (n.includes("1")) return "work1";
  if (n.includes("2")) return "work2";
  return null;
}

async function handleCommand(content) {
  const text = content.trim();
  if (!text.startsWith("!")) return null;

  const [command, ...rest] = text.slice(1).split(/\s+/);
  const arg = rest.join(" ");

  try {
    switch (command.toLowerCase()) {
      case "status":
        return t.statusReply(await api.getDevices());
      case "usage":
        return t.usageReply(await api.getUsage());
      case "room": {
        if (!arg) return t.unknownRoomReply();
        const room = matchRoom(arg);
        if (!room) return t.unknownRoomReply();
        const { status, data } = await api.getRoom(room);
        if (status === 404) return t.unknownRoomReply();
        return t.roomReply(data);
      }
      default:
        return null;
    }
  } catch {
    return t.backendDownReply();
  }
}

module.exports = { handleCommand, matchRoom };
