import express from "express";

const app = express();
app.use(express.json());

// In-memory outage tracking
let downSince = null;
let outages = [];

// Probe sends reports here
app.post("/report", (req, res) => {
  const { service, region, status, timestamp } = req.body;

  console.log(`📩 Report from ${region}: ${service} is ${status}`);

  // If service goes DOWN
  if (status === "DOWN") {
    if (!downSince) {
      downSince = Date.now();
      console.log("⚠️ Downtime started...");
    }

    const downTimeSeconds = (Date.now() - downSince) / 1000;

    // Confirm outage after 30s
    if (downTimeSeconds > 30) {
      const alreadyRecorded =
        outages.length > 0 && outages[outages.length - 1].end === null;

      if (!alreadyRecorded) {
        console.log("🚨 OUTAGE CONFIRMED (>30s)");

        outages.push({
          outage_id: `OUT-${outages.length + 1}`,
          service,
          start: new Date(downSince).toISOString(),
          end: null,
        });
      }
    }
  }

  // If service recovers
  if (status === "UP") {
    if (downSince) {
      console.log("✅ Service recovered");

      // Close active outage
      const activeOutage = outages.find((o) => o.end === null);
      if (activeOutage) {
        activeOutage.end = new Date().toISOString();
      }
    }

    downSince = null;
  }

  res.json({ ok: true });
});

// View outage history
app.get("/outages", (req, res) => {
  res.json(outages);
});

app.listen(4000, () => {
  console.log("✅ Backend running");
  console.log("➡️  Listening for probe reports at http://localhost:4000/report");
});
