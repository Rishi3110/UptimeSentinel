console.log("PROBE ACTIVE: Monitoring http://localhost:3000/health");
const SERVICE_URL = "http://localhost:3000/health";
const BACKEND_URL = "http://localhost:4000/report";

async function checkService() {
  let status = "DOWN";

  try {
    const start = Date.now();

    const res = await fetch(SERVICE_URL);

    if (res.ok) {
      status = "UP";
    }

    const latency = Date.now() - start;

    // Send report to backend
    await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: "fake-service",
        region: "local-probe",
        status,
        latency_ms: latency,
        timestamp: new Date().toISOString(),
      }),
    });

    console.log(`🛰️ Probe: ${status} (${latency}ms)`);
  } catch (err) {
    console.log("🛰️ Probe: DOWN (no response)");

    // Still report failure
    await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: "fake-service",
        region: "local-probe",
        status: "DOWN",
        latency_ms: null,
        timestamp: new Date().toISOString(),
      }),
    });
  }
}

// Run every 5 seconds
checkService();
setInterval(checkService, 5000);

console.log("✅ Probe started...");
console.log("Checking service every 5 seconds...");
