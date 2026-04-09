const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3100;
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "leaderboard.db");
const LEGACY_DATA_FILE = path.join(DATA_DIR, "leaderboard.json");
const DIFFICULTIES = ["easy", "normal", "hard"];

ensureDataDir();
const db = new Database(DB_FILE);
configureDatabase(db);
prepareSchema(db);
migrateLegacyJsonIfNeeded(db);

const statements = prepareStatements(db);
const saveResultTransaction = db.transaction((payload) => {
  const player = getOrCreatePlayer(statements, payload.playerName);
  const cityType = getOrCreateCityType(statements, payload.cityType);
  const recordId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const timestamp = new Date().toISOString();

  statements.insertGameResult.run(recordId, player.id, cityType.id, payload.difficulty, payload.totalScore, timestamp);
  statements.insertResultStats.run(
    recordId,
    payload.stats.environment,
    payload.stats.transport,
    payload.stats.happiness,
    payload.stats.development,
    payload.stats.finance,
  );

  return {
    id: recordId,
    playerName: player.name,
    difficulty: payload.difficulty,
    cityType: cityType.name,
    totalScore: payload.totalScore,
    stats: payload.stats,
    timestamp,
  };
});

const leaderboardCache = new Map();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "64kb" }));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "City Evolution Simulator backend is running.",
    timestamp: new Date().toISOString(),
    storage: "sqlite",
  });
});

app.get("/api/leaderboard", (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);

    if (leaderboardCache.has(limit)) {
      return res.json(leaderboardCache.get(limit));
    }

    const rows = statements.selectLeaderboard.all(limit);
    const result = {
      easy: [],
      normal: [],
      hard: [],
    };

    rows.forEach((row) => {
      const difficulty = normalizeDifficulty(row.difficulty);
      result[difficulty].push({
        id: row.id,
        playerName: row.playerName,
        difficulty,
        cityType: row.cityType,
        totalScore: row.totalScore,
        stats: {
          environment: row.environment,
          transport: row.transport,
          happiness: row.happiness,
          development: row.development,
          finance: row.finance,
        },
        timestamp: row.timestamp,
      });
    });

    leaderboardCache.set(limit, result);
    res.json(result);
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
      playerName: req.body.playerName.trim(),
      cityType: req.body.cityType.trim(),
      difficulty: normalizeDifficulty(req.body.difficulty),
      totalScore: clampNumber(req.body.totalScore, 0, 400),
      stats: sanitizeStats(req.body.stats),
    };

    const record = saveResultTransaction(sanitizedPayload);
    leaderboardCache.clear();

    res.status(201).json({
      message: "Result saved successfully.",
      record,
    });
  } catch (error) {
    console.error("Failed to save result:", error);
    res.status(500).json({ error: "Could not save result." });
  }
});

app.listen(PORT, () => {
  console.log(`City Evolution Simulator backend running on http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  db.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  db.close();
  process.exit(0);
});

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function configureDatabase(database) {
  database.pragma("journal_mode = WAL");
  database.pragma("synchronous = NORMAL");
  database.pragma("foreign_keys = ON");
  database.pragma("busy_timeout = 5000");
}

function prepareSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE COLLATE NOCASE
    );

    CREATE TABLE IF NOT EXISTS city_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS game_results (
      id TEXT PRIMARY KEY,
      player_id INTEGER NOT NULL,
      city_type_id INTEGER NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'normal',
      total_score INTEGER NOT NULL CHECK(total_score BETWEEN 0 AND 400),
      created_at TEXT NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (city_type_id) REFERENCES city_types(id)
    );

    CREATE TABLE IF NOT EXISTS result_stats (
      result_id TEXT PRIMARY KEY,
      environment INTEGER NOT NULL CHECK(environment BETWEEN 0 AND 100),
      transport INTEGER NOT NULL CHECK(transport BETWEEN 0 AND 100),
      happiness INTEGER NOT NULL CHECK(happiness BETWEEN 0 AND 100),
      development INTEGER NOT NULL CHECK(development BETWEEN 0 AND 100),
      finance INTEGER NOT NULL DEFAULT 50 CHECK(finance BETWEEN 0 AND 100),
      FOREIGN KEY (result_id) REFERENCES game_results(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_game_results_score_time
      ON game_results(total_score DESC, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_game_results_player_id
      ON game_results(player_id);
  `);

  ensureColumn(database, "game_results", "difficulty", "TEXT NOT NULL DEFAULT 'normal'");
  ensureColumn(database, "result_stats", "finance", "INTEGER NOT NULL DEFAULT 50 CHECK(finance BETWEEN 0 AND 100)");

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_game_results_difficulty
      ON game_results(difficulty);
  `);
}

function prepareStatements(database) {
  return {
    countResults: database.prepare("SELECT COUNT(*) AS count FROM game_results"),
    getPlayerByName: database.prepare("SELECT id, name FROM players WHERE name = ?"),
    insertPlayer: database.prepare("INSERT INTO players (name) VALUES (?)"),
    getCityTypeByName: database.prepare("SELECT id, name FROM city_types WHERE name = ?"),
    insertCityType: database.prepare("INSERT INTO city_types (name) VALUES (?)"),
    insertGameResult: database.prepare(`
      INSERT INTO game_results (id, player_id, city_type_id, difficulty, total_score, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `),
    insertResultStats: database.prepare(`
      INSERT INTO result_stats (result_id, environment, transport, happiness, development, finance)
      VALUES (?, ?, ?, ?, ?, ?)
    `),
    selectLeaderboard: database.prepare(`
      SELECT
        id,
        playerName,
        cityType,
        difficulty,
        totalScore,
        timestamp,
        environment,
        transport,
        happiness,
        development,
        finance
      FROM (
        SELECT
          gr.id AS id,
          p.name AS playerName,
          ct.name AS cityType,
          gr.difficulty AS difficulty,
          gr.total_score AS totalScore,
          gr.created_at AS timestamp,
          rs.environment AS environment,
          rs.transport AS transport,
          rs.happiness AS happiness,
          rs.development AS development,
          rs.finance AS finance,
          ROW_NUMBER() OVER (
            PARTITION BY gr.difficulty
            ORDER BY gr.total_score DESC, gr.created_at DESC
          ) AS difficultyRank
        FROM game_results gr
        INNER JOIN players p ON p.id = gr.player_id
        INNER JOIN city_types ct ON ct.id = gr.city_type_id
        INNER JOIN result_stats rs ON rs.result_id = gr.id
      )
      WHERE difficultyRank <= ?
      ORDER BY
        CASE difficulty
          WHEN 'easy' THEN 1
          WHEN 'normal' THEN 2
          WHEN 'hard' THEN 3
          ELSE 4
        END,
        totalScore DESC,
        timestamp DESC
    `),
  };
}

function migrateLegacyJsonIfNeeded(database) {
  if (!fs.existsSync(LEGACY_DATA_FILE)) {
    return;
  }

  const count = database.prepare("SELECT COUNT(*) AS count FROM game_results").get().count;
  if (count > 0) {
    return;
  }

  try {
    const raw = fs.readFileSync(LEGACY_DATA_FILE, "utf8");
    if (!raw.trim()) {
      return;
    }

    const legacyRecords = JSON.parse(raw);
    if (!Array.isArray(legacyRecords) || legacyRecords.length === 0) {
      return;
    }

    const stmts = prepareStatements(database);
    const migrateOne = database.transaction((entry) => {
      const validation = validateResult(entry);
      if (!validation.valid) {
        return;
      }

      const playerName = entry.playerName.trim();
      const cityTypeName = entry.cityType.trim();
      const difficulty = normalizeDifficulty(entry.difficulty);
      const totalScore = clampNumber(entry.totalScore, 0, 400);
      const stats = sanitizeStats(entry.stats);
      const player = getOrCreatePlayer(stmts, playerName);
      const cityType = getOrCreateCityType(stmts, cityTypeName);
      const resultId = typeof entry.id === "string" && entry.id.trim() ? entry.id.trim() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const timestamp = normalizeTimestamp(entry.timestamp);

      stmts.insertGameResult.run(resultId, player.id, cityType.id, difficulty, totalScore, timestamp);
      stmts.insertResultStats.run(
        resultId,
        stats.environment,
        stats.transport,
        stats.happiness,
        stats.development,
        stats.finance,
      );
    });

    legacyRecords.forEach((entry) => {
      try {
        migrateOne(entry);
      } catch (error) {
        // Skip malformed or duplicate legacy rows.
      }
    });
  } catch (error) {
    console.error("Legacy leaderboard migration failed:", error);
  }
}

function getOrCreatePlayer(stmts, playerName) {
  let player = stmts.getPlayerByName.get(playerName);
  if (player) {
    return player;
  }

  const inserted = stmts.insertPlayer.run(playerName);
  player = { id: inserted.lastInsertRowid, name: playerName };
  return player;
}

function getOrCreateCityType(stmts, cityTypeName) {
  let cityType = stmts.getCityTypeByName.get(cityTypeName);
  if (cityType) {
    return cityType;
  }

  const inserted = stmts.insertCityType.run(cityTypeName);
  cityType = { id: inserted.lastInsertRowid, name: cityTypeName };
  return cityType;
}

function parseLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return 100;
  }
  return Math.max(1, Math.min(parsed, 500));
}

function normalizeTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
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

  if (body.difficulty !== undefined && !isValidDifficulty(body.difficulty)) {
    return { valid: false, message: "difficulty must be easy, normal, or hard." };
  }

  if (!body.stats || typeof body.stats !== "object") {
    return { valid: false, message: "stats are required." };
  }

  const requiredStats = ["environment", "transport", "happiness", "development"];
  const statsAreValid = requiredStats.every((key) => Number.isFinite(Number(body.stats[key])));

  if (!statsAreValid) {
    return { valid: false, message: "All stats must be numeric." };
  }

  if (body.stats.finance !== undefined && !Number.isFinite(Number(body.stats.finance))) {
    return { valid: false, message: "finance must be numeric." };
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
    finance: clampNumber(inputStats.finance ?? 50, 0, 100),
  };
}

function normalizeDifficulty(value) {
  const normalized = String(value || "normal").trim().toLowerCase();
  if (DIFFICULTIES.includes(normalized)) {
    return normalized;
  }
  return "normal";
}

function isValidDifficulty(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return DIFFICULTIES.includes(normalized);
}

function ensureColumn(database, tableName, columnName, columnDefinition) {
  const columns = database.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = columns.some((column) => column.name === columnName);
  if (exists) {
    return;
  }
  database.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
}

function clampNumber(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return min;
  }
  return Math.max(min, Math.min(max, Math.round(numeric)));
}
