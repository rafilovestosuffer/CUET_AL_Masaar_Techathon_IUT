const api = require("./api");
const t = require("./templates");
const { humanize } = require("./humanize");
const { handleAsk } = require("./ask");

const ASK_ENABLED = (process.env.BOT_ASK || "on") !== "off";

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
      case "status": {
        const data = await api.getDevices();
        return humanize("status", t.statusFacts(data), t.statusReply(data));
      }
      case "usage": {
        const data = await api.getUsage();
        return humanize("usage", t.usageFacts(data), t.usageReply(data));
      }
      case "room": {
        if (!arg) return t.unknownRoomReply();
        const room = matchRoom(arg);
        if (!room) return t.unknownRoomReply();
        const { status, data } = await api.getRoom(room);
        if (status === 404) return t.unknownRoomReply();
        return humanize("room", t.roomFacts(data), t.roomReply(data));
      }
      case "ask": {
        if (!ASK_ENABLED) return null;
        if (!arg) return "Ask me a question, e.g. `!ask which room is wasting the most?`";
        return handleAsk(arg);
      }
      case "help":
        return t.helpReply();
      default:
        return null;
    }
  } catch {
    return t.backendDownReply();
  }
}

module.exports = { handleCommand, matchRoom };
