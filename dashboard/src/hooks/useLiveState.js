import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export function useLiveState() {
  const [snapshot, setSnapshot] = useState(null);
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState({ active: [], recent: [] });

  useEffect(() => {
    const socket = io(BACKEND_URL);

    const refreshAlerts = () =>
      fetch(`${BACKEND_URL}/api/alerts`)
        .then((r) => r.json())
        .then(setAlerts)
        .catch(() => {});

    socket.on("connect", () => {
      setConnected(true);
      refreshAlerts();
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("state:update", setSnapshot);
    socket.on("alert:new", refreshAlerts);

    const poll = setInterval(refreshAlerts, 20000);

    return () => {
      clearInterval(poll);
      socket.close();
    };
  }, []);

  return { snapshot, connected, alerts };
}
