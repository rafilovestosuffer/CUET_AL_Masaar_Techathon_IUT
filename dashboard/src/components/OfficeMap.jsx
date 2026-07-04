const ROOMS = [
  { key: "drawing", name: "Drawing Room", x: 40 },
  { key: "work1", name: "Work Room 1", x: 353 },
  { key: "work2", name: "Work Room 2", x: 666 },
];

const ROOM_W = 254;
const ROOM_Y = 50;
const ROOM_H = 400;
const AMBER = "#fbbf24";
const GRAY = "#374151";

const LIGHT_SLOTS = [
  [55, 150],
  [127, 150],
  [199, 150],
];
const FAN_SLOTS = [
  [90, 320],
  [164, 320],
];

const FURN_STROKE = "#374151";
const FURN_FILL = "rgba(255,255,255,0.03)";

// Static, muted furniture so the layout reads like the office floor plan (desks, chairs,
// a waiting-room sofa) without competing with the live device colours.
function Desk({ x, y }) {
  return (
    <g stroke={FURN_STROKE} strokeWidth={1.5} fill={FURN_FILL}>
      <rect x={x} y={y} width={74} height={24} rx={3} />
      <rect x={x + 26} y={y + 28} width={22} height={16} rx={7} />
    </g>
  );
}

function Sofa({ x, y }) {
  return (
    <g stroke={FURN_STROKE} strokeWidth={1.5} fill={FURN_FILL}>
      <rect x={x} y={y} width={150} height={44} rx={10} />
      <rect x={x + 12} y={y + 10} width={126} height={26} rx={6} />
      <rect x={x + 52} y={y + 54} width={46} height={20} rx={4} />
    </g>
  );
}

function Furniture({ roomKey, x, y }) {
  if (roomKey === "drawing") return <Sofa x={x + 52} y={y + 230} />;
  return (
    <>
      <Desk x={x + 34} y={y + 232} />
      <Desk x={x + 146} y={y + 232} />
    </>
  );
}

function Light({ cx, cy, on }) {
  return (
    <g>
      {on && <circle cx={cx} cy={cy} r={30} fill={AMBER} opacity={0.18} />}
      <circle
        cx={cx}
        cy={cy}
        r={13}
        fill={on ? AMBER : GRAY}
        style={{ filter: on ? `drop-shadow(0 0 9px ${AMBER})` : "none" }}
      />
    </g>
  );
}

function Fan({ cx, cy, on }) {
  const color = on ? AMBER : GRAY;
  return (
    <g
      className={on ? "fan-spinning" : ""}
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
    >
      <circle cx={cx} cy={cy} r={20} fill="none" stroke={color} strokeWidth={2} />
      <ellipse cx={cx} cy={cy - 11} rx={4.5} ry={9} fill={color} />
      <ellipse cx={cx} cy={cy + 11} rx={4.5} ry={9} fill={color} />
      <ellipse cx={cx - 11} cy={cy} rx={9} ry={4.5} fill={color} />
      <ellipse cx={cx + 11} cy={cy} rx={9} ry={4.5} fill={color} />
      <circle cx={cx} cy={cy} r={3} fill={color} />
    </g>
  );
}

export default function OfficeMap({ devices }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h2 className="mb-2 text-xs uppercase tracking-wide text-gray-400">Office floor</h2>
      <svg viewBox="0 0 960 500" className="w-full" role="img" aria-label="Office floor map">
        <rect x={20} y={30} width={920} height={440} rx={12} fill="none" stroke="#1f2937" strokeWidth={2} />

        {ROOMS.map((room) => {
          const roomDevices = devices.filter((d) => d.room === room.key);
          const fans = roomDevices.filter((d) => d.type === "fan");
          const lights = roomDevices.filter((d) => d.type === "light");
          const allOn = roomDevices.length > 0 && roomDevices.every((d) => d.status === "on");

          return (
            <g key={room.key}>
              <rect
                x={room.x}
                y={ROOM_Y}
                width={ROOM_W}
                height={ROOM_H}
                rx={8}
                fill={allOn ? "rgba(239,68,68,0.14)" : "rgba(255,255,255,0.03)"}
                stroke={allOn ? "rgba(239,68,68,0.6)" : "#374151"}
                strokeWidth={1.5}
              />
              <text x={room.x + ROOM_W / 2} y={ROOM_Y + 28} textAnchor="middle" fontSize={15} fill="#9ca3af">
                {room.name}
              </text>

              <Furniture roomKey={room.key} x={room.x} y={ROOM_Y} />

              {lights.map((d, i) => (
                <Light key={d.id} cx={room.x + LIGHT_SLOTS[i][0]} cy={ROOM_Y + LIGHT_SLOTS[i][1]} on={d.status === "on"} />
              ))}
              {fans.map((d, i) => (
                <Fan key={d.id} cx={room.x + FAN_SLOTS[i][0]} cy={ROOM_Y + FAN_SLOTS[i][1]} on={d.status === "on"} />
              ))}
            </g>
          );
        })}

        <rect x={440} y={462} width={80} height={16} rx={3} fill="#111827" stroke="#374151" />
        <text x={480} y={492} textAnchor="middle" fontSize={12} fill="#6b7280">
          Entry
        </text>
      </svg>
    </section>
  );
}
