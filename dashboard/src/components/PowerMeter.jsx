import RoomBreakdown from "./RoomBreakdown.jsx";

export default function PowerMeter({ watts, byRoom, kwhToday, costToday }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-400">Total power</div>
          <div className="text-4xl font-bold text-amber-400">
            {watts}
            <span className="text-lg font-normal text-gray-400"> W</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wide text-gray-400">Energy today</div>
          <div className="text-2xl font-semibold text-gray-200">
            {kwhToday}
            <span className="text-sm font-normal text-gray-400"> kWh</span>
          </div>
          <div className="mt-1 text-sm font-medium text-emerald-400">
            ৳{costToday} <span className="font-normal text-gray-500">today</span>
          </div>
        </div>
      </div>
      <RoomBreakdown byRoom={byRoom} />
    </section>
  );
}
