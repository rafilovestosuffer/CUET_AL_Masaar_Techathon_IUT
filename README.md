# OfficePulse

Real-time monitoring for a small office's lights and fans. One backend simulates 15
devices (3 rooms × 2 fans + 3 lights), and pushes live state to a web dashboard and a
Discord bot — so both always show the same numbers.

> Status: work in progress. Sections below are filled in as the build progresses.

## Problem

_TODO_

## Architecture

_TODO — diagram in `docs/` (draw.io)._

## Hardware / Wokwi

_TODO_

## Simulation design

_TODO_

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Node.js 20 + Express + Socket.IO |
| Dashboard | React + Vite + Tailwind |
| Bot | discord.js v14 |
| LLM | Gemini (free tier), with template fallback |

## Setup

```bash
cp .env.example .env      # backend + dashboard need ZERO keys; bot is optional-with-token
npm install
npm run dev:all
```

- Dashboard: http://localhost:5173
- Backend: http://localhost:3001
- Bot: connects only if `DISCORD_TOKEN` is set; otherwise it skips gracefully.

## Bot commands

| Command | Description |
|---|---|
| `!status` | Summary of all rooms |
| `!room <name>` | One room's devices |
| `!usage` | Current watts + estimated kWh today |

## AI integration

_TODO — LLM as a presentation layer only; fallback, timeout, number-integrity check._

## Contributions

_TODO_

## Attribution

Built with Express, Socket.IO, React, Vite, Tailwind, discord.js, Recharts, and the
Google Gemini API.

## Future scope

Swap the simulator for real ESP32 nodes publishing over MQTT — the rest of the system
is unchanged.
