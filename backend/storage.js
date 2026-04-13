const crypto = require("crypto");
const { cert, getApp, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const REQUIRED_STATS = ["environment", "finance", "happiness", "development"];
const LEADERBOARD_COLLECTION = "leaderboard_entries";
const RATE_LIMIT_COLLECTION = "request_rate_limits";
const DIFFICULTIES = ["easy", "normal", "hard"];

function createStorage() {
  const config = resolveFirebaseAdminConfig();
  const app = getOrCreateFirebaseAdminApp(config);
  const firestore = getFirestore(app);

  const ready = ensureStorageReady(firestore);

  return {
    ready,
    async getHealth() {
      await ready;
      await firestore.collection(LEADERBOARD_COLLECTION).limit(1).get();
      return {
        storage: "firestore-admin",
        projectId: config.projectId,
      };
    },
    async getLeaderboard(limitPerDifficulty) {
      await ready;
      const safeLimit = Math.max(1, Math.min(500, Number(limitPerDifficulty) || 100));
      const grouped = {
        easy: [],
        normal: [],
        hard: [],
      };

      const snapshots = await Promise.all(
        DIFFICULTIES.map((difficulty) =>
          firestore
            .collection(LEADERBOARD_COLLECTION)
            .where("difficulty", "==", difficulty)
            .get(),
        ),
      );

      snapshots.forEach((snapshot, index) => {
        const difficulty = DIFFICULTIES[index];
        grouped[difficulty] = snapshot.docs
          .map((document) => normalizeEntry(document.id, document.data()))
          .sort((left, right) => {
            if (right.totalScore !== left.totalScore) {
              return right.totalScore - left.totalScore;
            }

            return right.timestamp - left.timestamp;
          })
          .slice(0, safeLimit);
      });

      return grouped;
    },
    async saveResult(record) {
      await ready;
      const payload = normalizePersistedRecord(record);
      const reference = await firestore.collection(LEADERBOARD_COLLECTION).add(payload);
      return normalizeEntry(reference.id, payload);
    },
    async resetLeaderboard() {
      await ready;
      let deletedCount = 0;

      while (true) {
        const snapshot = await firestore.collection(LEADERBOARD_COLLECTION).limit(200).get();
        if (snapshot.empty) {
          break;
        }

        const batch = firestore.batch();
        snapshot.docs.forEach((document) => {
          batch.delete(document.ref);
        });
        await batch.commit();
        deletedCount += snapshot.docs.length;
      }

      return deletedCount;
    },
    async checkRateLimit({ key, ip, limit, windowMs }) {
      await ready;

      const normalizedKey = normalizeRateLimitKey(key);
      const normalizedIp = normalizeIp(ip);
      const safeLimit = Math.max(1, Number(limit) || 1);
      const safeWindowMs = Math.max(1000, Number(windowMs) || 60_000);

      const now = Date.now();
      const bucket = Math.floor(now / safeWindowMs);
      const resetAt = (bucket + 1) * safeWindowMs;
      const docId = `${normalizedKey}:${hashIp(normalizedIp)}:${bucket}`;
      const rateLimitRef = firestore.collection(RATE_LIMIT_COLLECTION).doc(docId);

      return firestore.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(rateLimitRef);
        const currentCount = snapshot.exists ? Number(snapshot.data()?.count || 0) : 0;

        if (currentCount >= safeLimit) {
          return {
            allowed: false,
            remaining: 0,
            resetAt,
            count: currentCount,
            limit: safeLimit,
          };
        }

        const nextCount = currentCount + 1;
        transaction.set(
          rateLimitRef,
          {
            key: normalizedKey,
            ipHash: hashIp(normalizedIp),
            bucket,
            count: nextCount,
            limit: safeLimit,
            createdAt: snapshot.exists ? snapshot.data()?.createdAt || now : now,
            updatedAt: now,
            expiresAt: resetAt + safeWindowMs * 24,
          },
          { merge: true },
        );

        return {
          allowed: true,
          remaining: Math.max(0, safeLimit - nextCount),
          resetAt,
          count: nextCount,
          limit: safeLimit,
        };
      });
    },
    async close() {
      return undefined;
    },
  };
}

async function ensureStorageReady(firestore) {
  await firestore.collection(LEADERBOARD_COLLECTION).limit(1).get();
}

function getOrCreateFirebaseAdminApp(config) {
  const appName = `kimd-admin-${config.projectId}`;

  if (getApps().some((app) => app.name === appName)) {
    return getApp(appName);
  }

  return initializeApp(
    {
      credential: cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey,
      }),
      projectId: config.projectId,
    },
    appName,
  );
}

function resolveFirebaseAdminConfig() {
  return {
    projectId: readRequiredEnv("FIREBASE_PROJECT_ID"),
    clientEmail: readRequiredEnv("FIREBASE_CLIENT_EMAIL"),
    privateKey: normalizePrivateKey(readRequiredEnv("FIREBASE_PRIVATE_KEY", { multiline: true })),
  };
}

function readRequiredEnv(name, options = {}) {
  const { multiline = false } = options;
  const value = normalizeEnvValue(process.env[name], { multiline });
  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function normalizeEnvValue(rawValue, options = {}) {
  const { multiline = false } = options;
  const raw = String(rawValue ?? "");
  const trimmed = raw.trim();
  const unquoted = (
    (trimmed.startsWith("\"") && trimmed.endsWith("\""))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))
  )
    ? trimmed.slice(1, -1)
    : trimmed;

  if (multiline) {
    return unquoted.trim();
  }

  return unquoted
    .replace(/\r?\n/g, "")
    .replace(/\\r\\n/g, "")
    .replace(/\\n/g, "")
    .trim();
}

function normalizePrivateKey(value) {
  const trimmed = String(value || "").trim();
  const unquoted = (
    (trimmed.startsWith("\"") && trimmed.endsWith("\""))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))
  )
    ? trimmed.slice(1, -1)
    : trimmed;

  return unquoted
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

function normalizePersistedRecord(record) {
  return {
    playerName: String(record.playerName || "").trim(),
    cityType: String(record.cityType || "").trim(),
    difficulty: normalizeDifficulty(record.difficulty),
    totalScore: Number(record.totalScore) || 0,
    stats: sanitizeStats(record.stats),
    timestamp: Date.now(),
  };
}

function normalizeEntry(id, input) {
  const source = input && typeof input === "object" ? input : {};

  return {
    id,
    playerName: String(source.playerName || "").trim(),
    cityType: String(source.cityType || "").trim(),
    difficulty: normalizeDifficulty(source.difficulty),
    totalScore: Number(source.totalScore) || 0,
    stats: sanitizeStats(source.stats),
    timestamp: normalizeTimestamp(source.timestamp),
  };
}

function normalizeTimestamp(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (value && typeof value.toMillis === "function") {
    return value.toMillis();
  }

  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  return Date.now();
}

function sanitizeStats(inputStats) {
  const source = inputStats && typeof inputStats === "object" ? inputStats : {};
  return REQUIRED_STATS.reduce((accumulator, key) => {
    if (key === "finance") {
      accumulator[key] = clampStat(source.finance ?? source.transport);
      return accumulator;
    }

    accumulator[key] = clampStat(source[key]);
    return accumulator;
  }, {});
}

function clampStat(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function normalizeDifficulty(value) {
  const difficulty = String(value || "").trim();
  if (difficulty === "easy" || difficulty === "normal" || difficulty === "hard") {
    return difficulty;
  }
  return "normal";
}

function normalizeRateLimitKey(value) {
  const key = String(value || "default").trim().toLowerCase();
  return key || "default";
}

function normalizeIp(value) {
  const ip = String(value || "").trim();
  return ip || "unknown";
}

function hashIp(ip) {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

module.exports = {
  createStorage,
};
