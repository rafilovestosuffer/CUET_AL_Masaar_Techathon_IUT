function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AlertsPanel({ active, recent }) {
  const resolved = recent.filter((a) => !a.active).slice(0, 3);

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-5">
      <h2 className="mb-3 text-xs uppercase tracking-wide text-gray-400">Alerts</h2>

      {active.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-gray-400">
          All clear ✅ — no anomalies
        </div>
      ) : (
        <ul className="space-y-2">
          {active.map((a) => (
            <li key={a.id} className="rounded-lg border-l-4 border-red-500 bg-red-500/10 px-3 py-2">
              <div className="text-sm text-red-100">{a.message}</div>
              <div className="mt-0.5 text-xs text-red-300/70">{formatTime(a.createdAt)}</div>
            </li>
          ))}
        </ul>
      )}

      {resolved.length > 0 && (
        <div className="mt-4">
          <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">Recently resolved</div>
          <ul className="space-y-1">
            {resolved.map((a) => (
              <li key={a.id} className="flex justify-between text-xs text-gray-500">
                <span className="truncate">{a.message}</span>
                <span className="ml-2 shrink-0">{formatTime(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
