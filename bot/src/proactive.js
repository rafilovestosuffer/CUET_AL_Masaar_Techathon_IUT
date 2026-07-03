const api = require("./api");
const t = require("./templates");
const { humanize } = require("./humanize");

const CHANNEL_ID = process.env.DISCORD_ALERT_CHANNEL_ID;
const ENABLED = (process.env.PROACTIVE || "on") !== "off";
const POLL_MS = 5000;

const seen = new Set();

function start(client) {
  if (!ENABLED || !CHANNEL_ID) {
    console.log("[bot] proactive alerts disabled (set PROACTIVE and DISCORD_ALERT_CHANNEL_ID to enable).");
    return;
  }

  let baseline = true;

  const poll = async () => {
    let active;
    try {
      ({ active } = await api.getAlerts());
    } catch {
      return;
    }

    const fresh = active.filter((a) => !seen.has(a.id));
    for (const a of active) seen.add(a.id);

    if (baseline) {
      baseline = false;
      return;
    }

    for (const alert of fresh) {
      const message = await humanize("alert", t.alertFacts(alert), t.alertReply(alert));
      try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        await channel.send(message);
      } catch (err) {
        console.error("[bot] failed to post proactive alert:", err.message);
      }
    }
  };

  setInterval(poll, POLL_MS);
  console.log("[bot] proactive alerts enabled.");
}

module.exports = { start };
