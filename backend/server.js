const express = require("express");
const cors = require("cors");

const { createStorage } = require("./storage");

const app = express();
const PORT = process.env.PORT || 3100;
const RESET_PASSWORD = typeof process.env.RESET_PASSWORD === "string" ? process.env.RESET_PASSWORD.trim() : "";
const FIRESTORE_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const FIRESTORE_RATE_LIMIT_MAX_REQUESTS = 20;
const storage = createStorage();

app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(cors());
app.use(express.json({ limit: "64kb" }));

app.get("/api/health", async (req, res) => {
  try {
    const health = await storage.getHealth();
    res.json({
      ok: true,
      message: "City Evolution Simulator backend is running.",
      timestamp: new Date().toISOString(),
      storage: health.storage,
      resetEnabled: Boolean(RESET_PASSWORD),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      ok: false,
      error: "Storage is unavailable.",
      timestamp: new Date().toISOString(),
    });
  }
});

app.get("/api/leaderboard", applyFirestoreRateLimit, async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const grouped = await storage.getLeaderboard(limit);
    res.json(grouped);
  } catch (error) {
    console.error("Failed to read leaderboard:", error);
    res.status(500).json({ error: "Could not read leaderboard data." });
  }
});

app.post("/api/result", applyFirestoreRateLimit, async (req, res) => {
  try {
    const validation = validateResult(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const sanitizedPayload = {
      playerName: req.body.playerName.trim(),
      cityType: req.body.cityType.trim(),
      difficulty: normalizeDifficulty(req.body.difficulty),
      totalScore: clampNumber(req.body.totalScore, 0, 40000),
      stats: sanitizeStats(req.body.stats),
    };

    const record = await storage.saveResult(sanitizedPayload);
    res.status(201).json({
      message: "Result saved successfully.",
      record,
    });
  } catch (error) {
    console.error("Failed to save result:", error);
    res.status(500).json({ error: "Could not save result." });
  }
});

app.get("/api/reset", (req, res) => {
  if (!RESET_PASSWORD) {
    return res.status(503).json({
      ok: false,
      error: "Reset endpoint is disabled.",
      method: "POST",
      path: "/api/reset",
    });
  }

  res.json({
    ok: true,
    message: "Use POST /api/reset with JSON body { password }.",
    method: "POST",
    path: "/api/reset",
    resetEnabled: true,
  });
});

app.post("/api/reset", applyFirestoreRateLimit, async (req, res) => {
  if (!RESET_PASSWORD) {
    return res.status(503).json({
      ok: false,
      error: "Reset endpoint is disabled.",
    });
  }

  try {
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!password) {
      return res.status(400).json({ ok: false, error: "password is required." });
    }

    if (password !== RESET_PASSWORD) {
      return res.status(401).json({ ok: false, error: "invalid password." });
    }

    const deletedCount = await storage.resetLeaderboard();
    res.json({
      ok: true,
      message: "Leaderboard reset completed.",
      deletedCount,
    });
  } catch (error) {
    console.error("Failed to reset leaderboard:", error);
    res.status(500).json({ ok: false, error: "Could not reset leaderboard." });
  }
});

if (require.main === module) {
  startServer();
}

module.exports = app;

async function startServer() {
  try {
    await storage.ready;
    app.listen(PORT, () => {
      console.log(`City Evolution Simulator backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error);
    process.exit(1);
  }
}

function parseLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return 100;
  }
  return Math.max(1, Math.min(parsed, 500));
}

async function applyFirestoreRateLimit(req, res, next) {
  try {
    const result = await storage.checkRateLimit({
      key: "firestore-api",
      ip: req.ip || req.socket?.remoteAddress || "unknown",
      limit: FIRESTORE_RATE_LIMIT_MAX_REQUESTS,
      windowMs: FIRESTORE_RATE_LIMIT_WINDOW_MS,
    });

    setRateLimitHeaders(res, result);

    if (!result.allowed) {
      res.status(429).json({
        ok: false,
        error: "Too many Firestore requests from this IP. Try again later.",
        retryAfterSeconds: Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000)),
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Keep the API available even when the limiter backend is temporarily unhealthy.
    res.setHeader("X-RateLimit-Bypass", "true");
    next();
  }
}

function setRateLimitHeaders(res, result) {
  const remaining = Math.max(0, Number(result.remaining) || 0);
  res.setHeader("X-RateLimit-Limit", String(FIRESTORE_RATE_LIMIT_MAX_REQUESTS));
  res.setHeader("X-RateLimit-Remaining", String(remaining));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil((Number(result.resetAt) || Date.now()) / 1000)));

  if (remaining === 0) {
    const resetAt = Number(result.resetAt) || Date.now();
    res.setHeader("Retry-After", String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))));
  }
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

  const requiredStats = ["environment", "happiness", "development"];
  const statsAreValid =
    requiredStats.every((key) => Number.isFinite(Number(body.stats[key])))
    && Number.isFinite(Number(body.stats.finance ?? body.stats.transport));

  if (!statsAreValid) {
    return { valid: false, message: "All stats must be numeric." };
  }

  if (!Number.isFinite(Number(body.totalScore))) {
    return { valid: false, message: "totalScore must be numeric." };
  }

  if (body.difficulty !== undefined && !isValidDifficulty(body.difficulty)) {
    return { valid: false, message: "difficulty must be one of easy, normal, hard." };
  }

  return { valid: true };
}

function sanitizeStats(inputStats) {
  return {
    environment: clampNumber(inputStats.environment, 0, 100),
    finance: clampNumber(inputStats.finance ?? inputStats.transport, 0, 100),
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

function isValidDifficulty(value) {
  return ["easy", "normal", "hard"].includes(String(value || "").trim());
}

function normalizeDifficulty(value) {
  if (isValidDifficulty(value)) {
    return String(value).trim();
  }
  return "normal";
}
