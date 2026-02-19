import express from "express";
const app = express();
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "fake-service",
    timestamp: new Date().toISOString(),
  });
});

app.listen(3000, () => {
  console.log("✅ Fake Service running");
  console.log("➡️  http://localhost:3000/health");
});
