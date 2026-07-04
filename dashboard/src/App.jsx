import { useLiveState } from "./hooks/useLiveState.js";
import PowerMeter from "./components/PowerMeter.jsx";
import RoomCard from "./components/RoomCard.jsx";
import AlertsPanel from "./components/AlertsPanel.jsx";
import OfficeMap from "./components/OfficeMap.jsx";
import LiveChart from "./components/LiveChart.jsx";

const SHOW_OFFICE_MAP = true;

const ROOMS = [
  ["drawing", "Drawing Room"],
  ["work1", "Work Room 1"],
  ["work2", "Work Room 2"],
];

function ConnectionPill({ connected }) {
  return (
    <span className="flex items-center gap-2 text-sm text-gray-400">
      <span className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-green-400" : "bg-amber-400"}`} />
      {connected ? "Live" : "Reconnecting…"}
    </span>
  );
}

function LoadingScreen() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
      <div className="h-28 animate-pulse rounded-xl bg-white/5" />
      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const { snapshot, connected, alerts } = useLiveState();

  if (!snapshot) return <LoadingScreen />;

  const { devices, totals, kwhToday, costToday, wattsHistory } = snapshot;

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <header className="mx-auto mb-4 flex max-w-6xl items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-400">OfficePulse</h1>
        <ConnectionPill connected={connected} />
      </header>

      {!connected && (
        <div className="mx-auto mb-4 max-w-6xl rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm text-amber-200">
          Lost connection to the office sensors — showing last known state and retrying…
        </div>
      )}

      <main className={`mx-auto max-w-6xl space-y-4 transition-opacity ${connected ? "" : "opacity-60"}`}>
        <div className="grid gap-4 lg:grid-cols-3">
          {SHOW_OFFICE_MAP ? (
            <>
              <div className="lg:col-span-2">
                <OfficeMap devices={devices} />
              </div>
              <div className="space-y-4">
                <PowerMeter watts={totals.watts} byRoom={totals.byRoom} kwhToday={kwhToday} costToday={costToday} />
                <AlertsPanel active={alerts.active} recent={alerts.recent} />
              </div>
            </>
          ) : (
            <>
              <div className="lg:col-span-2">
                <PowerMeter watts={totals.watts} byRoom={totals.byRoom} kwhToday={kwhToday} costToday={costToday} />
              </div>
              <AlertsPanel active={alerts.active} recent={alerts.recent} />
            </>
          )}
        </div>

        <LiveChart data={wattsHistory} />
        <div className="grid gap-4 lg:grid-cols-3">
          {ROOMS.map(([key, name]) => (
            <RoomCard key={key} name={name} devices={devices.filter((d) => d.room === key)} />
          ))}
        </div>
      </main>
    </div>
  );
}
