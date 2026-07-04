# API Contract — OfficePulse

Stable contract — changes require explicit team approval. The backend is the single
source of truth: all watt/kWh math is computed server-side. The dashboard and bot only read.

Base URL: `http://localhost:3001`

## Device model

The office has **15 devices**: 3 rooms × (2 fans + 3 lights).
Rooms: `drawing`, `work1`, `work2`.

```json
{
  "id": "work2-fan-1",
  "type": "fan",
  "room": "work2",
  "label": "Fan 1",
  "status": "on",
  "watts": 68,
  "lastChanged": "2026-07-03T14:22:05Z"
}
```

- `type`: `"fan"` | `"light"`
- `status`: `"on"` | `"off"`
- `watts`: fixed per device at seed (fans 60–75W, lights 12–18W)
- `id` pattern: `<room>-<type>-<n>` (fans 1–2, lights 1–3)

`costToday` = `kwhToday` × ৳8.95/kWh (Bangladesh commercial tariff). `wattsHistory` is a
rolling buffer of the last 60 total-watt samples (one per 5s tick) for the dashboard sparkline.

`insights` is a backend-computed summary reused by the dashboard and bot (never recomputed downstream):

```json
{
  "biggestRoom": { "room": "work2", "label": "Work Room 2", "watts": 182 },
  "afterHoursOnCount": 6,
  "costToday": 4.48,
  "projectedDailyCost": 53.06,
  "projectedMonthlyCost": 1591.8,
  "wastedCostToday": 11.05
}
```

## REST endpoints

### GET /api/devices
Full device snapshot.
```json
{
  "devices": [ /* Device[] */ ],
  "totals": { "watts": 740, "byRoom": { "drawing": 90, "work1": 0, "work2": 650 } },
  "kwhToday": 4.2,
  "costToday": 37.59,
  "wattsHistory": [ 720, 740, 650 ],
  "insights": { /* see insights object above */ },
  "simTime": "2026-07-03T14:22:05Z"
}
```
Error: `500 { "error": "..." }`

### GET /api/rooms/:name
One room's devices + watts. `name` is fuzzy-matched to `drawing` | `work1` | `work2`.
```json
{ "room": "work2", "devices": [ /* Device[] */ ], "watts": 650 }
```
Error: `404 { "error": "unknown room", "known": ["drawing", "work1", "work2"] }`

### GET /api/usage
Power summary for bot + dashboard.
```json
{ "watts": 740, "byRoom": { "drawing": 90, "work1": 0, "work2": 650 }, "kwhToday": 4.2, "costToday": 37.59, "insights": { /* see above */ }, "simTime": "..." }
```

### GET /api/insights
Boss-facing summary (biggest-draw room, after-hours device count, projected daily/monthly
cost, and Taka wasted today). Same object embedded in `/api/devices` and `/api/usage`.
```json
{ "biggestRoom": { "room": "work2", "label": "Work Room 2", "watts": 182 }, "afterHoursOnCount": 6, "costToday": 4.48, "projectedDailyCost": 53.06, "projectedMonthlyCost": 1591.8, "wastedCostToday": 11.05 }
```

### GET /api/alerts
Active + recent alerts.
```json
{ "active": [ /* Alert[] */ ], "recent": [ /* Alert[] */ ] }
```

```json
{
  "id": "a-17",
  "rule": "after-hours",
  "room": "work2",
  "message": "Work Room 2 has devices on after hours.",
  "wastedWh": 910,
  "wastedTaka": 8.14,
  "createdAt": "2026-07-03T22:05:00Z",
  "active": true
}
```
- `rule`: `"after-hours"` | `"2h-continuous"`
- `wastedWh`: backend estimate of energy wasted so far by the flagged room (watts × hours), updated live.
- `wastedTaka`: `wastedWh` valued at the ৳8.95/kWh tariff, updated live.

### POST /api/sim/scenario/:name
Deterministic demo triggers. `name` ∈ `forgot-devices` | `all-off` | `business-hours` | `reset`.
```json
{ "ok": true, "scenario": "forgot-devices" }
```
Error: `404 { "error": "unknown scenario" }`

## Socket.IO events (server → client)

- `state:update` — full snapshot (same shape as `GET /api/devices`), emitted on every state change.
- `alert:new` — a single `Alert` object, emitted when a new alert fires.

CORS / socket origin is locked to `http://localhost:5173`.
