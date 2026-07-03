const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.log("[bot] DISCORD_TOKEN not set — bot disabled. Dashboard and backend still run.");
}

// Keep the process alive so `dev:all` stays stable.
setInterval(() => {}, 1 << 30);
