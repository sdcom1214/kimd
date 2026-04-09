const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3100;
const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL ? path.join("/tmp", "city-evolution-simulator-data") : path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "leaderboard.json");

ensureDataDir();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "64kb" }));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "City Evolution Simulator backend is running.",
    timestamp: new Date().toISOString(),
    storage: "json",
  });
});

app.get("/api/leaderboard", (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const records = loadRecords();
    const sorted = records
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
      .slice(0, limit);

    res.json(sorted);
  } catch (error) {
    console.error("Failed to read leaderboard:", error);
    res.status(500).json({ error: "Could not read leaderboard data." });
  }
});

app.post("/api/result", (req, res) => {
  try {
    const validation = validateResult(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const sanitizedPayload = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      playerName: req.body.playerName.trim(),
      cityType: req.body.cityType.trim(),
      totalScore: clampNumber(req.body.totalScore, 0, 400),
      stats: sanitizeStats(req.body.stats),
      timestamp: new Date().toISOString(),
    };

    const records = loadRecords();
    records.push(sanitizedPayload);
    saveRecords(records);

    res.status(201).json({
      message: "Result saved successfully.",
      record: sanitizedPayload,
    });
  } catch (error) {
    console.error("Failed to save result:", error);
    res.status(500).json({ error: "Could not save result." });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`City Evolution Simulator backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadRecords() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }

  const raw = fs.readFileSync(DATA_FILE, "utf8");
  if (!raw.trim()) {
    return [];
  }

  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter((entry) => validateResult(entry).valid);
}

function saveRecords(records) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
}

function parseLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return 100;
  }
  return Math.max(1, Math.min(parsed, 500));
}

function validateResult(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, message: "Invalid request body." };
  }

  if (typeof body.playerName !== "string" || !body.playerName.trim()) {
    return { valid: false, message: "playerName is required." };
  }

  if (body.playerName.trim().length > 20) {
    return { valid: false, message: "playerName must be 20 characters or fewer." };
  }

  if (typeof body.cityType !== "string" || !body.cityType.trim()) {
    return { valid: false, message: "cityType is required." };
  }

  if (!body.stats || typeof body.stats !== "object") {
    return { valid: false, message: "stats are required." };
  }

  const requiredStats = ["environment", "transport", "happiness", "development"];
  const statsAreValid = requiredStats.every((key) => Number.isFinite(Number(body.stats[key])));

  if (!statsAreValid) {
    return { valid: false, message: "All stats must be numeric." };
  }

  if (!Number.isFinite(Number(body.totalScore))) {
    return { valid: false, message: "totalScore must be numeric." };
  }

  return { valid: true };
}

function sanitizeStats(inputStats) {
  return {
    environment: clampNumber(inputStats.environment, 0, 100),
    transport: clampNumber(inputStats.transport, 0, 100),
    happiness: clampNumber(inputStats.happiness, 0, 100),
    development: clampNumber(inputStats.development, 0, 100),
  };
}

function clampNumber(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return min;
  }
  return Math.max(min, Math.min(max, Math.round(numeric)));
}
