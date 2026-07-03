const LABELS = { drawing: "Drawing Room", work1: "Work Room 1", work2: "Work Room 2" };

export default function RoomBreakdown({ byRoom }) {
  const max = Math.max(1, ...Object.values(byRoom));
  return (
    <div className="mt-5 space-y-3">
      {Object.entries(byRoom).map(([room, watts]) => (
        <div key={room}>
          <div className="mb-1 flex justify-between text-xs text-gray-400">
            <span>{LABELS[room]}</span>
            <span>{watts} W</span>
          </div>
          <div className="h-2 rounded bg-white/10">
            <div
              className="h-2 rounded bg-amber-400/80 transition-all duration-500"
              style={{ width: `${(watts / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
