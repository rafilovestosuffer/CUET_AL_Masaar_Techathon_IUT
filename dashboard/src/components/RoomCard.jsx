import DeviceBadge from "./DeviceBadge.jsx";

export default function RoomCard({ name, devices }) {
  const onCount = devices.filter((d) => d.status === "on").length;
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-gray-200">{name}</h2>
        <span className="text-xs text-gray-400">
          {onCount}/{devices.length} on
        </span>
      </header>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {devices.map((d) => (
          <DeviceBadge key={d.id} device={d} />
        ))}
      </div>
    </section>
  );
}
