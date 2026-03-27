const API_BASE_URL = "http://localhost:3000";

const questions = [
  {
    prompt: "Traffic congestion is getting worse",
    choices: [
      {
        text: "Expand roads",
        effects: { transport: 8, development: 10, environment: -8, happiness: -2 },
      },
      {
        text: "Add more buses",
        effects: { transport: 12, environment: 4, happiness: 3 },
      },
      {
        text: "Build bike lanes",
        effects: { transport: 8, environment: 8, happiness: 4 },
      },
    ],
  },
  {
    prompt: "The city feels too gray",
    choices: [
      {
        text: "Build a large park",
        effects: { environment: 14, happiness: 8, development: -4 },
      },
      {
        text: "Build more shopping malls",
        effects: { development: 14, happiness: 3, environment: -10 },
      },
      {
        text: "Add rooftop gardens",
        effects: { environment: 8, development: 5, happiness: 5 },
      },
    ],
  },
  {
    prompt: "Students say the city is inconvenient",
    choices: [
      {
        text: "Improve bus routes",
        effects: { transport: 10, happiness: 6 },
      },
      {
        text: "Expand parking lots",
        effects: { development: 8, transport: 5, environment: -6 },
      },
      {
        text: "Create mixed-use public spaces",
        effects: { happiness: 10, environment: 5 },
      },
    ],
  },
  {
    prompt: "Air pollution is increasing",
    choices: [
      {
        text: "Restrict cars",
        effects: { environment: 12, transport: -3, happiness: 2 },
      },
      {
        text: "Plant trees",
        effects: { environment: 10, happiness: 4 },
      },
      {
        text: "Allow more industrial growth",
        effects: { development: 12, environment: -10 },
      },
    ],
  },
  {
    prompt: "Citizens want more places to relax",
    choices: [
      {
        text: "Build a riverside park",
        effects: { happiness: 12, environment: 8 },
      },
      {
        text: "Build apartments",
        effects: { development: 12, happiness: -4 },
      },
      {
        text: "Create a cultural plaza",
        effects: { happiness: 10, development: 4 },
      },
    ],
  },
  {
    prompt: "Budget is limited",
    choices: [
      {
        text: "Focus on green projects",
        effects: { environment: 10, development: -5 },
      },
      {
        text: "Focus on road expansion",
        effects: { transport: 10, environment: -6 },
      },
      {
        text: "Balance small upgrades",
        effects: { environment: 5, transport: 5, happiness: 5, development: 5 },
      },
    ],
  },
];

const screens = {
  start: document.getElementById("start-screen"),
  game: document.getElementById("game-screen"),
  result: document.getElementById("result-screen"),
  leaderboard: document.getElementById("leaderboard-screen"),
};

const cityLayers = {
  game: {
    stage: document.getElementById("city-stage"),
    backBuildings: document.getElementById("back-buildings"),
    frontBuildings: document.getElementById("front-buildings"),
    park: document.getElementById("park-layer"),
    road: document.getElementById("road-layer"),
    transport: document.getElementById("transport-layer"),
    happiness: document.getElementById("happiness-layer"),
    smog: document.getElementById("smog-layer"),
  },
  result: {
    stage: document.getElementById("result-city-stage"),
    backBuildings: document.getElementById("result-back-buildings"),
    frontBuildings: document.getElementById("result-front-buildings"),
    park: document.getElementById("result-park-layer"),
    road: document.getElementById("result-road-layer"),
    transport: document.getElementById("result-transport-layer"),
    happiness: document.getElementById("result-happiness-layer"),
    smog: document.getElementById("result-smog-layer"),
  },
};

const statElements = {
  environment: {
    value: document.getElementById("environment-value"),
    bar: document.getElementById("environment-bar"),
  },
  transport: {
    value: document.getElementById("transport-value"),
    bar: document.getElementById("transport-bar"),
  },
  happiness: {
    value: document.getElementById("happiness-value"),
    bar: document.getElementById("happiness-bar"),
  },
  development: {
    value: document.getElementById("development-value"),
    bar: document.getElementById("development-bar"),
  },
};

const roundLabel = document.getElementById("round-label");
const progressFill = document.getElementById("progress-fill");
const questionTitle = document.getElementById("question-title");
const choicesContainer = document.getElementById("choices-container");
const resultCityType = document.getElementById("result-city-type");
const resultFeedback = document.getElementById("result-feedback");
const resultStats = document.getElementById("result-stats");
const resultScore = document.getElementById("result-score");
const nicknameInput = document.getElementById("nickname-input");
const saveStatus = document.getElementById("save-status");
const leaderboardContent = document.getElementById("leaderboard-content");

let currentRound = 0;
let hasSavedCurrentRun = false;
let stats = createInitialStats();

document.getElementById("start-button").addEventListener("click", startGame);
document.getElementById("replay-button").addEventListener("click", startGame);
document.getElementById("leaderboard-replay-button").addEventListener("click", startGame);
document.getElementById("back-to-start-button").addEventListener("click", () => showScreen("start"));
document.getElementById("view-leaderboard-button").addEventListener("click", async () => {
  await fetchLeaderboard();
  showScreen("leaderboard");
});
document.getElementById("save-result-button").addEventListener("click", saveResult);

showScreen("start");
updateStatsUI();
updateCityVisual("game");
updateCityVisual("result");

function createInitialStats() {
  return {
    environment: 50,
    transport: 50,
    happiness: 50,
    development: 50,
  };
}

function showScreen(screenName) {
  Object.entries(screens).forEach(([name, element]) => {
    element.classList.toggle("active", name === screenName);
  });
}

function startGame() {
  currentRound = 0;
  hasSavedCurrentRun = false;
  stats = createInitialStats();
  nicknameInput.value = "";
  saveStatus.textContent = "";
  updateStatsUI();
  updateCityVisual("game");
  renderQuestion();
  showScreen("game");
}

function renderQuestion() {
  const question = questions[currentRound];

  roundLabel.textContent = `Round ${currentRound + 1} / ${questions.length}`;
  progressFill.style.width = `${(currentRound / questions.length) * 100}%`;
  questionTitle.textContent = question.prompt;
  choicesContainer.innerHTML = "";

  question.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = "choice-button";
    const summary = formatEffects(choice.effects);
    button.innerHTML = `<strong>${choice.text}</strong><span>${summary}</span>`;
    button.addEventListener("click", () => applyChoiceEffects(choice.effects));
    choicesContainer.appendChild(button);
  });
}

function applyChoiceEffects(effects) {
  Object.entries(effects).forEach(([statName, delta]) => {
    stats[statName] = clamp(stats[statName] + delta);
  });

  updateStatsUI();
  updateCityVisual("game");

  currentRound += 1;

  if (currentRound >= questions.length) {
    showResultScreen();
    return;
  }

  renderQuestion();
}

function updateStatsUI() {
  Object.entries(statElements).forEach(([name, refs]) => {
    refs.value.textContent = stats[name];
    refs.bar.style.width = `${stats[name]}%`;
  });
}

function updateCityVisual(mode) {
  const layers = cityLayers[mode];
  const { environment, transport, happiness, development } = stats;

  const skyTop = blendColor("#75838f", "#6fd0ff", environment / 100);
  const skyBottom = blendColor("#c0c5ca", "#dff8ff", environment / 100);
  const roadColor = blendColor("#6f5f5f", "#445a6d", transport / 100);
  const roadMarkingOpacity = (0.2 + transport / 140).toFixed(2);
  const treeColor = blendColor("#6f7f61", "#42b659", environment / 100);
  const smogOpacity = Math.max(0, (100 - environment) / 110 + development / 300).toFixed(2);
  const stageGlow = happiness > 60 ? "rgba(255, 211, 112, 0.24)" : "rgba(120, 126, 138, 0.12)";

  layers.stage.style.setProperty("--sky-top", skyTop);
  layers.stage.style.setProperty("--sky-bottom", skyBottom);
  layers.stage.style.setProperty("--road-color", roadColor);
  layers.stage.style.setProperty("--road-marking-opacity", roadMarkingOpacity);
  layers.stage.style.setProperty("--tree-color", treeColor);
  layers.stage.style.setProperty("--smog-opacity", smogOpacity);
  layers.stage.style.setProperty("--stage-glow", stageGlow);

  layers.backBuildings.innerHTML = renderBuildings(Math.max(4, Math.round(4 + development / 25)), development, true);
  layers.frontBuildings.innerHTML = renderBuildings(Math.max(5, Math.round(5 + development / 20)), development, false);
  layers.park.innerHTML = renderParksAndTrees(environment);
  layers.road.innerHTML = renderRoad(transport);
  layers.transport.innerHTML = renderTransport(transport, environment);
  layers.happiness.innerHTML = renderHappiness(happiness);
  layers.smog.style.opacity = smogOpacity;
}

function renderBuildings(count, developmentValue, isBackLayer) {
  const minHeight = isBackLayer ? 90 : 120;
  const maxHeight = isBackLayer ? 210 : 280;
  const scale = developmentValue / 100;
  let html = "";

  for (let i = 0; i < count; i += 1) {
    const ratio = ((i + 1) * 13) % 10 / 10;
    const height = minHeight + (maxHeight - minHeight) * (0.35 + scale * 0.65) * (0.55 + ratio * 0.45);
    const hueShift = Math.round((developmentValue - 50) * 0.4);
    html += `<div class="building" style="height:${Math.round(height)}px; filter:hue-rotate(${hueShift}deg) saturate(${0.88 + developmentValue / 220});"></div>`;
  }

  return html;
}

function renderParksAndTrees(environmentValue) {
  const patchCount = Math.max(1, Math.round(environmentValue / 28));
  const treeCount = Math.max(0, Math.round(environmentValue / 11));
  let html = "";

  for (let i = 0; i < patchCount; i += 1) {
    const left = 6 + i * (72 / patchCount);
    const width = 18 + (environmentValue / 12) * (0.6 + (i % 3) * 0.15);
    html += `<div class="park-patch" style="left:${left}%; width:${Math.min(width, 24)}%;"></div>`;
  }

  for (let i = 0; i < treeCount; i += 1) {
    const left = 4 + ((i * 11) % 88);
    const scale = 0.72 + ((i % 4) * 0.12);
    html += `<div class="tree" style="left:${left}%; transform:scale(${scale});"></div>`;
  }

  return html;
}

function renderRoad(transportValue) {
  const laneDensity = Math.max(3, Math.round(8 - transportValue / 18));
  let vehicles = "";

  for (let i = 0; i < laneDensity; i += 1) {
    const left = 4 + i * (90 / laneDensity);
    vehicles += `<div class="vehicle" style="left:${left}%;"></div>`;
  }

  return `
    <div class="road-base"></div>
    <div class="lane">${vehicles}</div>
  `;
}

function renderTransport(transportValue, environmentValue) {
  const busCount = Math.max(0, Math.round((transportValue - 35) / 18));
  const bikeCount = Math.max(0, Math.round((transportValue + environmentValue - 90) / 18));
  const congestion = transportValue < 45 ? `<div class="traffic-warning">Traffic Jam</div>` : "";
  let html = congestion;

  for (let i = 0; i < busCount; i += 1) {
    const left = 10 + i * 20;
    html += `<div class="bus-icon" style="left:${left}%; top:${44 + (i % 2) * 26}px;">BUS</div>`;
  }

  for (let i = 0; i < bikeCount; i += 1) {
    const left = 12 + i * 15;
    html += `<div class="bike-icon" style="left:${left}%; top:${22 + (i % 2) * 20}px;">BIKE</div>`;
  }

  return html;
}

function renderHappiness(happinessValue) {
  const benchCount = Math.max(0, Math.round((happinessValue - 30) / 14));
  const sparkleCount = Math.max(0, Math.round((happinessValue - 50) / 12));
  const showPlaza = happinessValue >= 65;
  const stress = happinessValue < 40 ? `<div class="stress-warning">Low Mood</div>` : "";
  let html = stress;

  if (showPlaza) {
    html += `<div class="plaza"></div>`;
  }

  for (let i = 0; i < benchCount; i += 1) {
    const left = 10 + i * 14;
    html += `<div class="bench" style="left:${left}%;"></div>`;
  }

  for (let i = 0; i < sparkleCount; i += 1) {
    const left = 16 + i * 14;
    html += `<div class="sparkle" style="left:${left}%; top:${84 + (i % 2) * 20}px;">✨</div>`;
  }

  if (happinessValue < 40) {
    html += `<div class="sad-cloud" style="left:18%;">☁️</div>`;
    html += `<div class="sad-cloud" style="left:64%; top:120px;">⚠️</div>`;
  }

  return html;
}

function calculateFinalType() {
  const { environment, transport, happiness, development } = stats;
  const balanced = [environment, transport, happiness, development].every((value) => value >= 45 && value <= 75);

  if (environment >= 70 && happiness >= 70) {
    return {
      title: "Sustainable Green City",
      description: "Your city invested in clean air, green spaces, and quality of life. It feels healthy, active, and future-ready.",
    };
  }

  if (development >= 75 && environment <= 45) {
    return {
      title: "Car-Centered Gray City",
      description: "Growth happened fast, but nature and air quality were pushed aside. The city is busy, crowded, and heavily road-focused.",
    };
  }

  if (balanced) {
    return {
      title: "Smart Balanced City",
      description: "You kept the city stable across all four areas. It may not be extreme, but it is practical, flexible, and resilient.",
    };
  }

  if (development >= 75 && happiness <= 45) {
    return {
      title: "Overdeveloped Stress City",
      description: "Buildings rose quickly, but people felt the pressure. The city became productive, yet harder to enjoy and live in.",
    };
  }

  return {
    title: "Growing Transition City",
    description: "Your city is still evolving. Some systems improved a lot, but others need more attention before the city feels fully sustainable.",
  };
}

function calculateTotalScore() {
  return stats.environment + stats.transport + stats.happiness + stats.development;
}

function showResultScreen() {
  const finalType = calculateFinalType();

  progressFill.style.width = "100%";
  resultCityType.textContent = finalType.title;
  resultFeedback.textContent = finalType.description;
  resultScore.textContent = `Total Score: ${calculateTotalScore()}`;
  resultStats.innerHTML = Object.entries(stats)
    .map(
      ([name, value]) =>
        `<div class="result-stat">${capitalize(name)}: <strong>${value}</strong></div>`,
    )
    .join("");

  updateCityVisual("result");
  saveStatus.textContent = "";
  showScreen("result");
}

async function saveResult() {
  if (hasSavedCurrentRun) {
    saveStatus.textContent = "This result is already saved. You can replay for a new run.";
    return;
  }

  const playerName = nicknameInput.value.trim();

  if (!playerName) {
    saveStatus.textContent = "Enter a nickname before saving.";
    return;
  }

  const payload = {
    playerName,
    stats,
    cityType: calculateFinalType().title,
    totalScore: calculateTotalScore(),
  };

  saveStatus.textContent = "Saving result...";

  try {
    const response = await fetch(`${API_BASE_URL}/api/result`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Save request failed");
    }

    hasSavedCurrentRun = true;
    saveStatus.textContent = "Saved. Opening leaderboard...";
    await fetchLeaderboard();
    showScreen("leaderboard");
  } catch (error) {
    console.error(error);
    saveStatus.textContent = "Could not save result. Check that the backend is running on port 3000.";
  }
}

async function fetchLeaderboard() {
  leaderboardContent.innerHTML = `<div class="leaderboard-empty">Loading leaderboard...</div>`;

  try {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard`);

    if (!response.ok) {
      throw new Error("Leaderboard request failed");
    }

    const data = await response.json();
    renderLeaderboard(data);
  } catch (error) {
    console.error(error);
    leaderboardContent.innerHTML = `
      <div class="leaderboard-empty">
        Could not load leaderboard.<br />
        Start the backend server at ${API_BASE_URL}.
      </div>
    `;
  }
}

function renderLeaderboard(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    leaderboardContent.innerHTML = `
      <div class="leaderboard-empty">
        No saved runs yet.<br />
        Finish a game and save your result to create the first ranking.
      </div>
    `;
    return;
  }

  leaderboardContent.innerHTML = entries
    .map(
      (entry, index) => `
        <article class="leaderboard-row">
          <div class="rank-chip">#${index + 1}</div>
          <strong>${escapeHtml(entry.playerName)}</strong>
          <span>${escapeHtml(entry.cityType)}</span>
          <div class="score-chip">${entry.totalScore}</div>
          <span>${formatDate(entry.timestamp)}</span>
        </article>
      `,
    )
    .join("");
}

function formatEffects(effects) {
  return Object.entries(effects)
    .map(([name, value]) => `${capitalize(name)} ${value > 0 ? "+" : ""}${value}`)
    .join(" • ");
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function blendColor(colorA, colorB, amount) {
  const [r1, g1, b1] = hexToRgb(colorA);
  const [r2, g2, b2] = hexToRgb(colorB);
  const r = Math.round(r1 + (r2 - r1) * amount);
  const g = Math.round(g1 + (g2 - g1) * amount);
  const b = Math.round(b1 + (b2 - b1) * amount);
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
