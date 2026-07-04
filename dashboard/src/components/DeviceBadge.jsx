function FanIcon({ on }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className={on ? "fan-spinning" : ""}
      fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="1.6" />
      <path d="M12 10.4C12 6 13 3 15 3s2.5 3 0 6" />
      <path d="M13.6 12C18 12 21 13 21 15s-3 2.5-6 0" />
      <path d="M12 13.6C12 18 11 21 9 21s-2.5-3 0-6" />
      <path d="M10.4 12C6 12 3 11 3 9s3-2.5 6 0" />
    </svg>
  );
}

function BulbIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20"
      fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

export default function DeviceBadge({ device }) {
  const on = device.status === "on";
  return (
    <div
      role="status"
      aria-label={`${device.label}: ${on ? "on" : "off"}, ${device.watts} watts`}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
        on ? "border-amber-400/50 bg-amber-400/10 text-amber-300" : "border-white/10 bg-white/5 text-gray-500"
      }`}
    >
      {device.type === "fan" ? <FanIcon on={on} /> : <BulbIcon />}
      <div className="min-w-0 flex-1">
        <div className={`truncate text-sm font-medium ${on ? "text-amber-100" : "text-gray-300"}`}>
          {device.label}
        </div>
        <div className="text-xs text-gray-500">{device.watts} W</div>
      </div>
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
          on ? "bg-amber-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.7)]" : "bg-gray-600"
        }`}
      />
    </div>
  );
}
