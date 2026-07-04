function Stat({ label, value, sub, accent }) {
  return (
    <div className="flex-1">
      <div className="text-[11px] uppercase tracking-wide text-gray-400">{label}</div>
      <div className={`text-lg font-semibold ${accent || "text-gray-100"}`}>{value}</div>
      {sub && <div className="text-[11px] text-gray-500">{sub}</div>}
    </div>
  );
}

export default function InsightsBar({ insights }) {
  if (!insights) return null;
  const { biggestRoom, projectedMonthlyCost, wastedCostToday } = insights;

  return (
    <section className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <Stat
        label="Biggest draw"
        value={biggestRoom.label}
        sub={`${biggestRoom.watts} W now`}
      />
      <Stat
        label="At this rate"
        value={`৳${projectedMonthlyCost}`}
        sub="per month"
        accent="text-amber-400"
      />
      <Stat
        label="Wasted today"
        value={`৳${wastedCostToday}`}
        sub={wastedCostToday > 0 ? "left-on devices" : "nothing wasted"}
        accent={wastedCostToday > 0 ? "text-red-400" : "text-emerald-400"}
      />
    </section>
  );
}
