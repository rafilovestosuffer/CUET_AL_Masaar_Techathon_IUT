const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const TIMEOUT_MS = 3000;

async function fetchRaw(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, { signal: controller.signal });
    return { status: res.status, data: await res.json() };
  } finally {
    clearTimeout(timer);
  }
}

async function getUsage() {
  const { status, data } = await fetchRaw("/api/usage");
  if (status >= 400) throw new Error(`usage HTTP ${status}`);
  return data;
}

async function getDevices() {
  const { status, data } = await fetchRaw("/api/devices");
  if (status >= 400) throw new Error(`devices HTTP ${status}`);
  return data;
}

async function getRoom(name) {
  return fetchRaw(`/api/rooms/${encodeURIComponent(name)}`);
}

async function getAlerts() {
  const { status, data } = await fetchRaw("/api/alerts");
  if (status >= 400) throw new Error(`alerts HTTP ${status}`);
  return data;
}

module.exports = { getUsage, getDevices, getRoom, getAlerts };
