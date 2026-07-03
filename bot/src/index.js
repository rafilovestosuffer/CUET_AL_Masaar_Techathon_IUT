const { Client, GatewayIntentBits, Events } = require("discord.js");
const { handleCommand } = require("./commands");

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.log("[bot] DISCORD_TOKEN not set — bot disabled. Dashboard and backend still run.");
  return;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`[bot] logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  try {
    const reply = await handleCommand(message.content);
    if (reply) await message.reply(reply);
  } catch (err) {
    console.error("[bot] failed to handle message:", err.message);
  }
});

client.login(token).catch((err) => {
  console.error("[bot] login failed:", err.message);
});
