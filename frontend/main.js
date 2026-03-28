const API_BASE_URL = "http://localhost:3000";

const questions = [
  {
    prompt: "교통 혼잡이 점점 심해지고 있습니다",
    choices: [
      {
        text: "도로를 확장한다",
        effects: { transport: 8, development: 10, environment: -8, happiness: -2 },
      },
      {
        text: "버스를 더 늘린다",
        effects: { transport: 12, environment: 4, happiness: 3 },
      },
      {
        text: "자전거 도로를 만든다",
        effects: { transport: 8, environment: 8, happiness: 4 },
      },
    ],
  },
  {
    prompt: "도시 분위기가 너무 삭막하고 회색빛입니다",
    choices: [
      {
        text: "큰 공원을 만든다",
        effects: { environment: 14, happiness: 8, development: -4 },
      },
      {
        text: "쇼핑몰을 더 짓는다",
        effects: { development: 14, happiness: 3, environment: -10 },
      },
      {
        text: "옥상 정원을 늘린다",
        effects: { environment: 8, development: 5, happiness: 5 },
      },
    ],
  },
  {
    prompt: "학생들이 도시가 불편하다고 말합니다",
    choices: [
      {
        text: "버스 노선을 개선한다",
        effects: { transport: 10, happiness: 6 },
      },
      {
        text: "주차장을 늘린다",
        effects: { development: 8, transport: 5, environment: -6 },
      },
      {
        text: "복합 공공공간을 만든다",
        effects: { happiness: 10, environment: 5 },
      },
    ],
  },
  {
    prompt: "대기 오염이 증가하고 있습니다",
    choices: [
      {
        text: "자동차 운행을 제한한다",
        effects: { environment: 12, transport: -3, happiness: 2 },
      },
      {
        text: "나무를 심는다",
        effects: { environment: 10, happiness: 4 },
      },
      {
        text: "산업 성장을 더 허용한다",
        effects: { development: 12, environment: -10 },
      },
    ],
  },
  {
    prompt: "시민들은 더 많은 휴식 공간을 원합니다",
    choices: [
      {
        text: "강변 공원을 만든다",
        effects: { happiness: 12, environment: 8 },
      },
      {
        text: "아파트를 더 짓는다",
        effects: { development: 12, happiness: -4 },
      },
      {
        text: "문화 광장을 만든다",
        effects: { happiness: 10, development: 4 },
      },
    ],
  },
  {
    prompt: "예산이 부족합니다",
    choices: [
      {
        text: "친환경 사업에 집중한다",
        effects: { environment: 10, development: -5 },
      },
      {
        text: "도로 확장에 집중한다",
        effects: { transport: 10, environment: -6 },
      },
      {
        text: "작은 개선을 균형 있게 한다",
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
  showScreen("game");

  requestAnimationFrame(() => {
    updateStatsUI();
    updateCityVisual("game");
    renderQuestion();
  });
}

function renderQuestion() {
  const question = questions[currentRound];

  roundLabel.textContent = `${currentRound + 1} / ${questions.length} 라운드`;
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
  const congestion = transportValue < 45 ? `<div class="traffic-warning">교통 정체</div>` : "";
  let html = congestion;

  for (let i = 0; i < busCount; i += 1) {
    const left = 10 + i * 20;
    html += `<div class="bus-icon" style="left:${left}%; top:${44 + (i % 2) * 26}px;">버스</div>`;
  }

  for (let i = 0; i < bikeCount; i += 1) {
    const left = 12 + i * 15;
    html += `<div class="bike-icon" style="left:${left}%; top:${22 + (i % 2) * 20}px;">자전거</div>`;
  }

  return html;
}

function renderHappiness(happinessValue) {
  const benchCount = Math.max(0, Math.round((happinessValue - 30) / 14));
  const sparkleCount = Math.max(0, Math.round((happinessValue - 50) / 12));
  const showPlaza = happinessValue >= 65;
  const stress = happinessValue < 40 ? `<div class="stress-warning">행복도 낮음</div>` : "";
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
      title: "지속가능한 친환경 도시",
      description: "깨끗한 공기와 녹지, 시민의 삶의 질을 잘 지켜낸 도시입니다. 건강하고 활기차며 미래지향적인 모습입니다.",
    };
  }

  if (development >= 75 && environment <= 45) {
    return {
      title: "자동차 중심의 회색 도시",
      description: "개발은 빠르게 진행됐지만 자연과 공기 질이 뒤로 밀렸습니다. 도로와 차량 중심의 복잡한 도시가 되었습니다.",
    };
  }

  if (balanced) {
    return {
      title: "균형 잡힌 스마트 도시",
      description: "환경, 교통, 행복, 발전을 고르게 관리했습니다. 극단적이진 않지만 안정적이고 지속 가능한 도시입니다.",
    };
  }

  if (development >= 75 && happiness <= 45) {
    return {
      title: "과개발 스트레스 도시",
      description: "건물과 개발은 빠르게 늘었지만 시민의 만족도는 떨어졌습니다. 효율적이지만 살기 편한 도시는 아닙니다.",
    };
  }

  return {
    title: "변화 중인 성장 도시",
    description: "일부 영역은 크게 좋아졌지만 아직 더 다듬을 부분이 남아 있습니다. 발전 가능성이 큰 도시입니다.",
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
  resultScore.textContent = `총점: ${calculateTotalScore()}점`;
  resultStats.innerHTML = Object.entries(stats)
    .map(
      ([name, value]) =>
        `<div class="result-stat">${getStatLabel(name)}: <strong>${value}</strong></div>`,
    )
    .join("");

  updateCityVisual("result");
  saveStatus.textContent = "";
  showScreen("result");
}

async function saveResult() {
  if (hasSavedCurrentRun) {
    saveStatus.textContent = "이번 결과는 이미 저장되었습니다. 다시 플레이하면 새 기록을 만들 수 있습니다.";
    return;
  }

  const playerName = nicknameInput.value.trim();

  if (!playerName) {
    saveStatus.textContent = "저장하기 전에 닉네임을 입력하세요.";
    return;
  }

  const payload = {
    playerName,
    stats,
    cityType: calculateFinalType().title,
    totalScore: calculateTotalScore(),
  };

  saveStatus.textContent = "결과를 저장하는 중입니다...";

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
    saveStatus.textContent = "저장되었습니다. 리더보드를 여는 중입니다...";
    await fetchLeaderboard();
    showScreen("leaderboard");
  } catch (error) {
    console.error(error);
    saveStatus.textContent = "결과를 저장하지 못했습니다. 백엔드 서버가 3000번 포트에서 실행 중인지 확인하세요.";
  }
}

async function fetchLeaderboard() {
  leaderboardContent.innerHTML = `<div class="leaderboard-empty">리더보드를 불러오는 중입니다...</div>`;

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
        리더보드를 불러오지 못했습니다.<br />
        ${API_BASE_URL} 에서 백엔드 서버를 실행하세요.
      </div>
    `;
  }
}

function renderLeaderboard(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    leaderboardContent.innerHTML = `
      <div class="leaderboard-empty">
        아직 저장된 기록이 없습니다.<br />
        게임을 끝내고 결과를 저장하면 첫 순위가 만들어집니다.
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
    .map(([name, value]) => `${getStatLabel(name)} ${value > 0 ? "+" : ""}${value}`)
    .join(" • ");
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function getStatLabel(name) {
  const labels = {
    environment: "환경",
    transport: "교통",
    happiness: "행복",
    development: "발전",
  };

  return labels[name] || name;
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
    return "알 수 없음";
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
