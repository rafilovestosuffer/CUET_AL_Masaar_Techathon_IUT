const AMBER = "#fbbf24";
const GRAY = "#374151";
const RED = "#ef4444";

// Room box in world units; each room owns an origin along +x so the three
// boxes read as one floor with a corridor gap between them.
const W = 200;
const D = 200;
const H = 80;

const ROOMS = [
  { key: "drawing", name: "Drawing Room", ox: 0 },
  { key: "work1", name: "Work Room 1", ox: 240 },
  { key: "work2", name: "Work Room 2", ox: 480 },
];

// Device positions on the room-local floor grid (lights + fans hang from the ceiling).
const LIGHT_SLOTS = [
  [60, 60],
  [140, 60],
  [100, 145],
];
const FAN_SLOTS = [
  [65, 130],
  [150, 115],
];

// Standard 2:1 isometric projection: world (x, y) on the floor, z = height.
function iso(wx, wy, wz = 0) {
  return { x: wx - wy, y: (wx + wy) * 0.5 - wz };
}

const pts = (arr) => arr.map((p) => `${p.x},${p.y}`).join(" ");

// Extruded box: top + the two camera-facing faces at three lightness levels.
function Prism({ ox, oy, x, y, z = 0, w, d, h, top, left, right }) {
  const p = (lx, ly, lz) => iso(ox + x + lx, oy + y + ly, z + lz);
  return (
    <g>
      <polygon points={pts([p(0, d, h), p(w, d, h), p(w, d, 0), p(0, d, 0)])} fill={left} />
      <polygon points={pts([p(w, 0, h), p(w, d, h), p(w, d, 0), p(w, 0, 0)])} fill={right} />
      <polygon points={pts([p(0, 0, h), p(w, 0, h), p(w, d, h), p(0, d, h)])} fill={top} />
    </g>
  );
}

function IsoDesk({ ox, oy, x, y }) {
  return (
    <g>
      <Prism ox={ox} oy={oy} x={x} y={y} w={60} d={26} h={22} top="#4b5563" left="#374151" right="#2b3444" />
      <Prism ox={ox} oy={oy} x={x + 20} y={y + 9} z={22} w={17} d={4} h={13} top="#6b7280" left="#4b5563" right="#374151" />
    </g>
  );
}

function IsoSofa({ ox, oy }) {
  return (
    <g>
      <Prism ox={ox} oy={oy} x={55} y={95} w={90} d={30} h={14} top="#4b5563" left="#374151" right="#2b3444" />
      <Prism ox={ox} oy={oy} x={55} y={87} w={90} d={9} h={28} top="#4b5563" left="#374151" right="#2b3444" />
      <Prism ox={ox} oy={oy} x={78} y={140} w={44} d={22} h={11} top="#3f4a5c" left="#333d4d" right="#28303d" />
    </g>
  );
}

function IsoLight({ device, ox, oy, slot }) {
  const [lx, ly] = slot;
  const on = device.status === "on";
  const top = iso(ox + lx, oy + ly, H);
  const fix = iso(ox + lx, oy + ly, H - 8);
  const floor = iso(ox + lx, oy + ly, 0);
  return (
    <g style={{ cursor: "help" }}>
      <title>{`${device.label} — ${device.status.toUpperCase()} — ${device.watts} W — since ${new Date(device.lastChanged).toLocaleTimeString()}`}</title>
      {on && (
        <g className="light-pulse">
          <polygon
            points={pts([fix, { x: floor.x - 46, y: floor.y }, { x: floor.x + 46, y: floor.y }])}
            fill="url(#iso-cone)"
          />
          <ellipse cx={floor.x} cy={floor.y} rx={46} ry={23} fill="url(#iso-pool)" />
        </g>
      )}
      <line x1={top.x} y1={top.y} x2={fix.x} y2={fix.y} stroke={on ? AMBER : "#4b5563"} strokeWidth={1.5} />
      {on && (
        <>
          <circle cx={fix.x} cy={fix.y} r={14} fill={AMBER} opacity={0.15} />
          <circle cx={fix.x} cy={fix.y} r={8} fill={AMBER} opacity={0.35} />
        </>
      )}
      <circle cx={fix.x} cy={fix.y} r={4.5} fill={on ? AMBER : GRAY} />
    </g>
  );
}

function IsoFan({ device, ox, oy, slot }) {
  const [fx, fy] = slot;
  const on = device.status === "on";
  const color = on ? AMBER : GRAY;
  const top = iso(ox + fx, oy + fy, H);
  const hub = iso(ox + fx, oy + fy, H - 18);
  return (
    <g style={{ cursor: "help" }}>
      <title>{`${device.label} — ${device.status.toUpperCase()} — ${device.watts} W — since ${new Date(device.lastChanged).toLocaleTimeString()}`}</title>
      <line x1={top.x} y1={top.y} x2={hub.x} y2={hub.y} stroke="#4b5563" strokeWidth={2} />
      {/* Blades rotate as a true circle, then the outer group squashes them into the
          isometric plane — so the spin sweeps a correct ellipse instead of skewing. */}
      <g transform={`translate(${hub.x} ${hub.y}) scale(1 0.5)`}>
        {on && <circle r={23} fill={AMBER} opacity={0.08} />}
        <g className={on ? "fan-spinning-fast" : ""} style={{ transformOrigin: "0px 0px" }}>
          <ellipse cx={0} cy={-13} rx={4.5} ry={11} fill={color} />
          <ellipse cx={0} cy={13} rx={4.5} ry={11} fill={color} />
          <ellipse cx={-13} cy={0} rx={11} ry={4.5} fill={color} />
          <ellipse cx={13} cy={0} rx={11} ry={4.5} fill={color} />
        </g>
        <circle r={3.5} fill={color} />
      </g>
    </g>
  );
}

function IsoRoom({ room, index, devices, alerted }) {
  const { ox, name, key } = room;
  const oy = 0;
  const p = (lx, ly, lz = 0) => iso(ox + lx, oy + ly, lz);
  const floor = [p(0, 0), p(W, 0), p(W, D), p(0, D)];
  const lights = devices.filter((d) => d.type === "light");
  const fans = devices.filter((d) => d.type === "fan");
  const onCount = devices.filter((d) => d.status === "on").length;
  const label = p(W / 2, 0, H + 20);

  return (
    <g className="room-rise" style={{ animationDelay: `${index * 120}ms` }}>
      <polygon points={pts(floor)} fill="rgba(255,255,255,0.03)" stroke={GRAY} strokeWidth={1.5} />
      {onCount > 0 && (
        <polygon points={pts(floor)} fill="url(#iso-floor-warm)" opacity={0.15 + 0.15 * (onCount / devices.length)} />
      )}
      {/* Back walls only, so room contents stay visible. */}
      <polygon
        points={pts([p(0, 0, H), p(0, D, H), p(0, D), p(0, 0)])}
        fill="rgba(255,255,255,0.04)"
        stroke={GRAY}
        strokeWidth={1}
      />
      <polygon
        points={pts([p(0, 0, H), p(W, 0, H), p(W, 0), p(0, 0)])}
        fill="rgba(255,255,255,0.07)"
        stroke={GRAY}
        strokeWidth={1}
      />

      {lights.map((d, i) => (
        <IsoLight key={d.id} device={d} ox={ox} oy={oy} slot={LIGHT_SLOTS[i]} />
      ))}

      {key === "drawing" ? (
        <IsoSofa ox={ox} oy={oy} />
      ) : (
        <>
          <IsoDesk ox={ox} oy={oy} x={35} y={95} />
          <IsoDesk ox={ox} oy={oy} x={120} y={140} />
        </>
      )}

      {fans.map((d, i) => (
        <IsoFan key={d.id} device={d} ox={ox} oy={oy} slot={FAN_SLOTS[i]} />
      ))}

      {alerted && (
        <polygon points={pts(floor)} fill="none" stroke={RED} strokeWidth={2.5} className="alert-glow" />
      )}

      <text x={label.x} y={label.y} textAnchor="middle" fontSize={15} fill={alerted ? "#fca5a5" : "#9ca3af"}>
        {name}
      </text>

      {key === "drawing" && (
        <>
          <line
            x1={p(80, D).x}
            y1={p(80, D).y}
            x2={p(120, D).x}
            y2={p(120, D).y}
            stroke="#6b7280"
            strokeWidth={4}
          />
          <text x={p(100, D + 26).x} y={p(100, D + 26).y} textAnchor="middle" fontSize={12} fill="#6b7280">
            Entry
          </text>
        </>
      )}
    </g>
  );
}

export default function OfficeMap({ devices, alertRooms = [] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h2 className="mb-2 text-xs uppercase tracking-wide text-gray-400">Office floor</h2>
      <svg viewBox="0 0 960 560" className="w-full" role="img" aria-label="Isometric office floor map">
        <defs>
          <radialGradient id="iso-pool">
            <stop offset="0%" stopColor={AMBER} stopOpacity={0.35} />
            <stop offset="100%" stopColor={AMBER} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="iso-cone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={AMBER} stopOpacity={0.35} />
            <stop offset="100%" stopColor={AMBER} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="iso-floor-warm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={AMBER} stopOpacity={0.5} />
            <stop offset="100%" stopColor={AMBER} stopOpacity={0.1} />
          </linearGradient>
        </defs>

        <g transform="translate(240 110)">
          {ROOMS.map((room, i) => (
            <IsoRoom
              key={room.key}
              room={room}
              index={i}
              devices={devices.filter((d) => d.room === room.key)}
              alerted={alertRooms.includes(room.key)}
            />
          ))}
        </g>
      </svg>
    </section>
  );
}
