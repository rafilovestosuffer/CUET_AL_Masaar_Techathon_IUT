const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const state = require("./state");
const sim = require("./simulator");
const { router, buildDevicesResponse } = require("./routes");

const PORT = process.env.PORT || 3001;
const ORIGIN = "http://localhost:5173";

const app = express();
app.use(express.json());
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", ORIGIN);
  res.header("Access-Control-Allow-Methods", "GET,POST");
  next();
});

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "officepulse-backend" }));
app.use("/api", router);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: ORIGIN } });

io.on("connection", (socket) => {
  socket.emit("state:update", buildDevicesResponse());
});

state.events.on("change", () => {
  io.emit("state:update", buildDevicesResponse());
});

sim.start();
server.listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT}`);
});
