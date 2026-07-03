import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export function useLiveState() {
  const [snapshot, setSnapshot] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(BACKEND_URL);

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("state:update", setSnapshot);

    return () => socket.close();
  }, []);

  return { snapshot, connected };
}
