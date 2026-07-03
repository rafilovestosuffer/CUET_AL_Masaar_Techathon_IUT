const express = require("express");

const PORT = process.env.PORT || 3001;
const app = express();

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "officepulse-backend" });
});

app.listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT}`);
});
