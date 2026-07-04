import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function LiveChart({ data }) {
  const points = (data ?? []).map((w, i) => ({ i, watts: w }));

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xs uppercase tracking-wide text-gray-400">Power over time</h2>
        <span className="text-xs text-gray-500">last ~5 minutes</span>
      </div>

      {points.length < 2 ? (
        <div className="flex h-[220px] items-center justify-center text-sm text-gray-500">
          Collecting power history…
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={points} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="wattsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="i" tick={false} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} height={4} />
            <YAxis
              width={44}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              unit=" W"
            />
            <Tooltip
              contentStyle={{ background: "#0b0f19", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
              labelStyle={{ display: "none" }}
              formatter={(v) => [`${v} W`, "Total power"]}
            />
            <Area type="monotone" dataKey="watts" stroke="#fbbf24" strokeWidth={2} fill="url(#wattsFill)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
