const API_BASE_URL = resolveApiBaseUrl();
const API_BASE_CANDIDATES = buildApiBaseCandidates(API_BASE_URL);

const QUESTION_SETS = {
  easy: [
    {
      prompt: "교통이 불편합니다",
      choices: [
        {
          text: "도로를 일부 재정비한다",
          effects: { finance: -15, development: 5, environment: -2, happiness: 3 },
        },
        {
          text: "도로를 완전 재정비한다",
          effects: { finance: -30, development: 10, environment: -5, happiness: 7 },
        },
        {
          text: "내버려둔다",
          effects: { finance: 10, development: -4, happiness: -5 },
        },
      ],
    },
    {
      prompt: "도시가 너무 칙칙합니다",
      choices: [
        {
          text: "자연 환경을 조성한다",
          effects: { finance: -20, happiness: 10, environment: 15 },
        },
        {
          text: "거리 미관과 휴식 공간을 함께 정비한다",
          effects: { finance: -12, happiness: 6, environment: 8, development: 1 },
        },
        {
          text: "내버려둔다",
          effects: { finance: 15, development: -2, happiness: -10, environment: -5 },
        },
      ],
    },
    {
      prompt: "도시 개발이 필요합니다",
      choices: [
        {
          text: "전면적 개발을 진행한다",
          effects: { finance: -40, development: 15, environment: -15, happiness: 10 },
        },
        {
          text: "부분적 개발을 진행한다",
          effects: { finance: -20, development: 8, environment: -10, happiness: 5 },
        },
        {
          text: "내버려둔다",
          effects: { finance: 20, development: -6, happiness: -5, environment: 5 },
        },
      ],
    },
    {
      prompt: "학교가 부족합니다",
      choices: [
        {
          text: "학교를 건설한다",
          effects: { finance: -25, development: 8, happiness: 10 },
        },
        {
          text: "기존 시설을 증축한다",
          effects: { finance: -15, development: 4, happiness: 6 },
        },
        {
          text: "내버려둔다",
          effects: { finance: 10, development: -4, happiness: -10 },
        },
      ],
    },
    {
      prompt: "병원이 부족합니다",
      choices: [
        {
          text: "종합병원을 새로 건설한다",
          effects: { finance: -30, development: 6, happiness: 15 },
        },
        {
          text: "소형 병원을 늘린다",
          effects: { finance: -15, development: 3, happiness: 7 },
        },
        {
          text: "내버려둔다",
          effects: { finance: 10, development: -4, happiness: -15 },
        },
      ],
    },
    {
      prompt: "길거리가 어둡습니다",
      choices: [
        {
          text: "가로등을 대대적으로 설치한다",
          effects: { finance: -15, development: 5, happiness: 5 },
        },
        {
          text: "위험 지역 위주로 일부만 설치한다",
          effects: { finance: -8, development: 3, happiness: 2 },
        },
        {
          text: "내버려둔다",
          effects: { finance: 10, development: -5, happiness: -5 },
        },
      ],
    },
  ],
  normal: [
    {
      prompt: "아이를 찾아달라는 신고가 들어왔습니다",
      choices: [
        {
          text: "대규모 수색 인력을 투입한다",
          effects: { finance: -10, development: 4, environment: -1, happiness: 5 },
        },
        {
          text: "실종 경보 방송과 CCTV 추적을 병행한다",
          effects: { development: 2, happiness: -3 },
        },
        {
          text: "무시한다",
          effects: { happiness: -15, development: -3 },
        },
      ],
    },
    {
      prompt: "일자리가 부족합니다",
      choices: [
        {
          text: "기업 의무 채용 정책을 시행한다",
          effects: { finance: -25, happiness: 15, development: 5 },
        },
        {
          text: "직업 교육과 창업 지원을 함께 늘린다",
          effects: { finance: -12, happiness: 8, development: 4 },
        },
        {
          text: "내버려둔다",
          effects: { finance: 20, happiness: -20, development: -6 },
        },
      ],
    },
    {
      prompt: "강력 범죄가 발생했습니다",
      choices: [
        {
          text: "경찰 인력과 순찰을 대폭 강화한다",
          effects: { finance: -20, development: 7, happiness: 15 },
        },
        {
          text: "방범 카메라와 신고 체계를 확대한다",
          effects: { finance: -10, development: 4, happiness: 6 },
        },
        {
          text: "내버려둔다",
          effects: { finance: 15, happiness: -20, development: -8 },
        },
      ],
    },
    {
      prompt: "집값이 너무 비쌉니다",
      choices: [
        {
          text: "주거 지역을 대폭 늘린다",
          effects: { finance: -30, environment: -10, development: 10, happiness: 5 },
        },
        {
          text: "공공주택과 기반시설을 함께 확충한다",
          effects: { finance: -18, environment: -6, development: 6, happiness: 4 },
        },
        {
          text: "내버려둔다",
          effects: { finance: 20, happiness: -15, development: -5 },
        },
      ],
    },
    {
      prompt: "쓰레기 매립지가 부족합니다",
      choices: [
        {
          text: "추가 매립지를 확보한다",
          effects: { finance: -15, happiness: -10, environment: 5, development: 3 },
        },
        {
          text: "재활용과 분리수거 시스템을 강화한다",
          effects: { finance: -10, environment: 10, development: 2 },
        },
        {
          text: "내버려둔다",
          effects: { finance: 15, environment: -13, development: -4 },
        },
      ],
    },
    {
      prompt: "대기업 본사가 우리 도시에 관심을 보입니다",
      choices: [
        {
          text: "지원 정책을 펼쳐 본사 이전을 유도한다",
          effects: { finance: -10, development: 15, environment: -15, happiness: 10 },
        },
        {
          text: "조건부로 제한적 지원만 제공한다",
          effects: { finance: -6, development: 10, environment: -6, happiness: 6 },
        },
        {
          text: "거부한다",
          effects: { happiness: -7, development: -5, environment: 15 },
        },
      ],
    },
  ],
  hard: [
    {
      prompt: "오일쇼크가 발생했습니다",
      choices: [
        {
          text: "유가 보조금 정책을 실시한다",
          effects: { finance: -25, happiness: 7, development: 3 },
        },
        {
          text: "가격 제한 정책을 시행한다",
          effects: { finance: -15, development: -3, happiness: 2 },
        },
        {
          text: "시장에 맡기고 버틴다",
          effects: { finance: 10, happiness: -12, development: -8 },
        },
      ],
    },
    {
      prompt: "지진이 발생했습니다",
      choices: [
        {
          text: "피해 지역 재개발을 실시한다",
          effects: { finance: -25, happiness: -4, environment: -5, development: 8 },
        },
        {
          text: "사고 수습과 내진 설계 정책을 함께 시행한다",
          effects: { finance: -20, happiness: 5, environment: 2, development: 7 },
        },
        {
          text: "최소한의 복구만 진행한다",
          effects: { finance: -5, happiness: 5, development: -5 },
        },
      ],
    },
    {
      prompt: "빈부격차가 너무 심해졌습니다",
      choices: [
        {
          text: "대규모 복지 정책을 시행한다",
          effects: { finance: -30, happiness: 18, development: 2 },
        },
        {
          text: "세금과 복지 체계를 개편한다",
          effects: { finance: 25, happiness: -12, development: -2 },
        },
        {
          text: "무시한다",
          effects: { finance: 10, happiness: -20, development: -5 },
        },
      ],
    },
    {
      prompt: "전력 공급이 부족합니다",
      choices: [
        {
          text: "발전소를 건설한다",
          effects: { finance: -15, environment: -10, development: 12 },
        },
        {
          text: "다른 도시로부터 전력을 공급받는다",
          effects: { finance: -20, development: 5 },
        },
        {
          text: "무시한다",
          effects: { finance: 20, happiness: -13, development: -10 },
        },
      ],
    },
    {
      prompt: "기업 파산 위기가 닥쳤습니다",
      choices: [
        {
          text: "긴급 구제금융을 투입해 회생을 돕는다",
          effects: { finance: -35, environment: -10, development: 15, happiness: 7 },
        },
        {
          text: "구조조정과 산업 전환을 조건으로 지원한다",
          effects: { finance: -10, environment: -3, development: 6, happiness: 4 },
        },
        {
          text: "무시한다",
          effects: { finance: 10, development: -20, happiness: -10, environment: 13 },
        },
      ],
    },
    {
      prompt: "사이버 테러가 발생했습니다",
      choices: [
        {
          text: "보안 시스템을 전면 개편한다",
          effects: { finance: -15, happiness: -3, development: 5 },
        },
        {
          text: "핵심 기능만 복구하고 단계적으로 대응한다",
          effects: { finance: -5, happiness: -7, development: 2 },
        },
        {
          text: "무시한다",
          effects: { finance: 10, happiness: -10, development: -4 },
        },
      ],
    },
  ],
};

const DIFFICULTY_LEVELS = {
  easy: {
    label: "쉬움",
    previewMode: "direction",
    variance: 0,
    sideEffectChance: 0,
    sideEffectRange: [0, 0],
  },
  normal: {
    label: "보통",
    previewMode: "direction",
    variance: 2,
    sideEffectChance: 0.25,
    sideEffectRange: [1, 3],
  },
  hard: {
    label: "어려움",
    previewMode: "none",
    variance: 4,
    sideEffectChance: 0.55,
    sideEffectRange: [2, 6],
  },
};

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
  finance: {
    value: document.getElementById("finance-value"),
    bar: document.getElementById("finance-bar"),
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
const choiceHelper = document.getElementById("choice-helper");
const choicesContainer = document.getElementById("choices-container");
const currentDifficultyBadge = document.getElementById("current-difficulty-badge");
const difficultyModal = document.getElementById("difficulty-modal");
const difficultyOptions = Array.from(document.querySelectorAll(".difficulty-option"));
const confirmDifficultyButton = document.getElementById("confirm-difficulty-button");
const selectedDifficultyLabel = document.getElementById("selected-difficulty-label");
const resultCityType = document.getElementById("result-city-type");
const resultFeedback = document.getElementById("result-feedback");
const resultStats = document.getElementById("result-stats");
const resultScore = document.getElementById("result-score");
const nicknameInput = document.getElementById("nickname-input");
const saveStatus = document.getElementById("save-status");
const leaderboardContent = document.getElementById("leaderboard-content");

let currentRound = 0;
let hasSavedCurrentRun = false;
let currentDifficulty = "";
let activeQuestions = [];
let stats = createInitialStats();
let selectedChoiceIndexes = [];

document.getElementById("start-button").addEventListener("click", beginDifficultySelection);
document.getElementById("replay-button").addEventListener("click", beginDifficultySelection);
document.getElementById("leaderboard-replay-button").addEventListener("click", beginDifficultySelection);
document.getElementById("back-to-start-button").addEventListener("click", () => showScreen("start"));
document.getElementById("view-leaderboard-button").addEventListener("click", async () => {
  await fetchLeaderboard();
  showScreen("leaderboard");
});
document.getElementById("save-result-button").addEventListener("click", saveResult);
confirmDifficultyButton.addEventListener("click", () => {
  if (!currentDifficulty) {
    return;
  }
  startGame();
});

difficultyOptions.forEach((button) => {
  button.addEventListener("click", () => {
    selectDifficulty(button.dataset.difficulty);
  });
});

showScreen("start");
updateStatsUI();
updateCityVisual("game");
updateCityVisual("result");
updateSelectedDifficultyLabel();

function createInitialStats() {
  return {
    environment: 40,
    finance: 80,
    happiness: 50,
    development: 30,
  };
}

function showScreen(screenName) {
  Object.entries(screens).forEach(([name, element]) => {
    element.classList.toggle("active", name === screenName);
  });
}

function startGame() {
  if (!currentDifficulty) {
    openDifficultyModal();
    return;
  }

  closeDifficultyModal();
  currentRound = 0;
  hasSavedCurrentRun = false;
  selectedChoiceIndexes = [];
  stats = createInitialStats();
  activeQuestions = QUESTION_SETS[currentDifficulty] || QUESTION_SETS.normal;
  nicknameInput.value = "";
  saveStatus.textContent = "";
  showScreen("game");

  requestAnimationFrame(() => {
    updateStatsUI();
    updateCityVisual("game");
    renderQuestion();
  });
}

function beginDifficultySelection() {
  // The difficulty modal lives inside the start screen, so make it visible first.
  showScreen("start");
  currentDifficulty = "";
  selectedChoiceIndexes = [];
  currentDifficultyBadge.textContent = "선택 필요";
  confirmDifficultyButton.disabled = true;
  difficultyOptions.forEach((button) => {
    button.classList.remove("selected");
  });
  updateSelectedDifficultyLabel();
  requestAnimationFrame(() => {
    openDifficultyModal();
  });
}

function renderQuestion() {
  const question = activeQuestions[currentRound];
  const totalRounds = activeQuestions.length;
  const difficulty = DIFFICULTY_LEVELS[currentDifficulty];
  const roundChoices = question.choices.map((choice) => {
    const effects = applyDifficultyToEffects(choice.effects, difficulty);
    const summary = getChoiceSummary(effects, difficulty.previewMode);
    return { ...choice, effects, summary };
  });

  roundLabel.textContent = `${currentRound + 1} / ${totalRounds} 라운드 · ${difficulty.label}`;
  progressFill.style.width = `${(currentRound / totalRounds) * 100}%`;
  currentDifficultyBadge.textContent = difficulty.label;
  questionTitle.classList.toggle("compact-title", currentDifficulty === "hard");
  questionTitle.textContent = question.prompt;
  choiceHelper.textContent = getDifficultyGuideText(currentDifficulty);
  choicesContainer.innerHTML = "";
  let hasPickedChoice = false;

  roundChoices.forEach((choice, choiceIndex) => {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.innerHTML = `<strong>${choice.text}</strong><span>${choice.summary}</span>`;
    button.addEventListener("click", () => {
      if (hasPickedChoice) {
        return;
      }

      hasPickedChoice = true;
      const buttons = Array.from(choicesContainer.querySelectorAll(".choice-button"));

      buttons.forEach((item) => {
        item.disabled = true;
        item.classList.add("is-locked");
      });

      button.classList.add("is-selected");
      buttons.forEach((item) => {
        if (item !== button) {
          item.classList.add("is-dim");
        }
      });

      window.setTimeout(() => {
        applyChoiceEffects(choice.effects, choiceIndex);
      }, 260);
    });
    choicesContainer.appendChild(button);
  });
}

function applyChoiceEffects(effects, choiceIndex) {
  selectedChoiceIndexes.push(choiceIndex);

  Object.entries(effects).forEach(([statName, delta]) => {
    stats[statName] = clamp(stats[statName] + delta);
  });

  stats.finance = clamp(stats.finance + calculateRoundIncome(stats.development));

  updateStatsUI();
  updateCityVisual("game");

  currentRound += 1;

  if (currentRound >= activeQuestions.length) {
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
  const { environment, finance, happiness, development } = stats;
  const infrastructure = calculateInfrastructureScore();

  const skyTop = blendColor("#75838f", "#6fd0ff", environment / 100);
  const skyBottom = blendColor("#c0c5ca", "#dff8ff", environment / 100);
  const roadColor = blendColor("#6f5f5f", "#445a6d", infrastructure / 100);
  const roadMarkingOpacity = (0.2 + infrastructure / 140).toFixed(2);
  const treeColor = blendColor("#6f7f61", "#42b659", environment / 100);
  const smogOpacity = Math.max(0, (100 - environment) / 110 + development / 300).toFixed(2);
  const stageGlow = finance > 60 ? "rgba(119, 190, 255, 0.22)" : happiness > 60 ? "rgba(255, 211, 112, 0.24)" : "rgba(120, 126, 138, 0.12)";

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
  layers.road.innerHTML = renderRoad(infrastructure);
  layers.transport.innerHTML = renderTransport(infrastructure, environment);
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
  const { environment, finance, happiness, development } = stats;
  const balanced = [environment, finance, happiness, development].every((value) => value >= 40 && value <= 75);

  if (environment >= 70 && happiness >= 70 && finance >= 45) {
    return {
      title: "지속가능한 친환경 도시",
      description: "깨끗한 공기와 녹지, 시민의 삶의 질을 잘 지켜낸 도시입니다. 건강하고 활기차며 미래지향적인 모습입니다.",
    };
  }

  if (development >= 75 && environment <= 35) {
    return {
      title: "과열 개발 중심 도시",
      description: "성장은 빨랐지만 환경과 삶의 질이 밀려났습니다. 성과는 크지만 오래 버티기 어려운 도시입니다.",
    };
  }

  if (balanced) {
    return {
      title: "균형 잡힌 지속가능 도시",
      description: "제정, 발전, 행복, 환경을 고르게 관리했습니다. 화려하진 않아도 안정적이고 오래 가는 도시입니다.",
    };
  }

  if (finance <= 25 && happiness <= 45) {
    return {
      title: "재정 압박 도시",
      description: "문제를 해결하려고 많이 투자했지만 제정 여력이 크게 줄었습니다. 다음 위기에 대비한 체력 회복이 필요합니다.",
    };
  }

  return {
    title: "변화 중인 성장 도시",
    description: "일부 영역은 크게 좋아졌지만 아직 더 다듬을 부분이 남아 있습니다. 발전 가능성이 큰 도시입니다.",
  };
}

function calculateTotalScore() {
  const weightedAverage = (
    stats.environment * 0.3
    + stats.finance * 0.2
    + stats.happiness * 0.25
    + stats.development * 0.25
  );
  const statValues = Object.values(stats);
  const spread = Math.max(...statValues) - Math.min(...statValues);
  const balanceBonus = Math.max(0, 120 - spread * 2);
  const difficultyBonus = getDifficultyBonus(currentDifficulty);

  return Math.round(weightedAverage * 8 + balanceBonus + difficultyBonus);
}

showResultScreen = function showResultScreenPatched() {
  const finalType = calculateFinalType();

  progressFill.style.width = "100%";
  resultCityType.textContent = finalType.title;
  resultFeedback.textContent = `${finalType.description} 총점은 가중 평균 + 균형 보너스 + 난이도 보너스로 계산됩니다.`;
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
};

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
    difficulty: currentDifficulty || "normal",
    totalScore: calculateTotalScore(),
  };

  saveStatus.textContent = "결과를 저장하는 중입니다...";

  try {
    const response = await requestApi("/api/result", {
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
    saveStatus.textContent = `결과를 저장하지 못했습니다. API 경로(${formatApiBaseCandidates(API_BASE_CANDIDATES)})를 확인하세요.`;
  }
}

async function fetchLeaderboard() {
  leaderboardContent.innerHTML = `<div class="leaderboard-empty">리더보드를 불러오는 중입니다...</div>`;

  try {
    const response = await requestApi("/api/leaderboard");

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
        API 경로(${formatApiBaseCandidates(API_BASE_CANDIDATES)})를 확인하세요.
      </div>
    `;
  }
}

function renderLeaderboard(entries) {
  const difficultyOrder = ["easy", "normal", "hard"];
  const groupedEntries = normalizeLeaderboardEntries(entries);
  const hasAnyEntry = difficultyOrder.some((difficulty) => groupedEntries[difficulty].length > 0);

  if (!hasAnyEntry) {
    leaderboardContent.innerHTML = `
      <div class="leaderboard-empty">
        아직 저장된 기록이 없습니다.<br />
        게임을 끝내고 결과를 저장하면 첫 순위가 만들어집니다.
      </div>
    `;
    return;
  }

  leaderboardContent.innerHTML = difficultyOrder
    .map((difficulty) => {
      const sectionEntries = groupedEntries[difficulty];

      if (sectionEntries.length === 0) {
        return `
          <section class="leaderboard-section">
            <h3 class="leaderboard-section-title">${DIFFICULTY_LEVELS[difficulty].label}</h3>
            <div class="leaderboard-empty">아직 저장된 기록이 없습니다.</div>
          </section>
        `;
      }

      const rows = sectionEntries
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

      return `
        <section class="leaderboard-section">
          <h3 class="leaderboard-section-title">${DIFFICULTY_LEVELS[difficulty].label}</h3>
          ${rows}
        </section>
      `;
    })
    .join("");
}

function normalizeLeaderboardEntries(entries) {
  const grouped = {
    easy: [],
    normal: [],
    hard: [],
  };

  if (Array.isArray(entries)) {
    entries.forEach((entry) => {
      const difficulty = normalizeDifficultyValue(entry.difficulty);
      grouped[difficulty].push(entry);
    });
    return grouped;
  }

  if (!entries || typeof entries !== "object") {
    return grouped;
  }

  Object.keys(grouped).forEach((difficulty) => {
    if (Array.isArray(entries[difficulty])) {
      grouped[difficulty] = entries[difficulty];
    }
  });

  return grouped;
}

function normalizeDifficultyValue(value) {
  if (value === "easy" || value === "normal" || value === "hard") {
    return value;
  }
  return "normal";
}

function formatEffects(effects) {
  return Object.entries(effects)
    .map(([name, value]) => `${getStatLabel(name)} ${value > 0 ? "+" : ""}${value}`)
    .join(" • ");
}

function getChoiceSummary(effects, previewMode) {
  if (previewMode === "exact") {
    return formatEffects(effects);
  }

  if (previewMode === "direction") {
    return Object.entries(effects)
      .map(([name, value]) => `${getStatLabel(name)} ${value > 0 ? "상승" : "하락"}`)
      .join(" • ");
  }

  return "결과를 예측하기 어렵습니다.";
}

function applyDifficultyToEffects(baseEffects, difficulty) {
  const adjusted = {};
  const variance = difficulty.variance || 0;

  Object.entries(baseEffects).forEach(([statName, delta]) => {
    let value = delta;

    if (variance > 0) {
      value += getRandomInt(-variance, variance);
    }

    if (delta > 0) {
      value = Math.max(1, value);
    } else if (delta < 0) {
      value = Math.min(-1, value);
    }

    adjusted[statName] = value;
  });

  if (difficulty.sideEffectChance > 0 && Math.random() < difficulty.sideEffectChance) {
    const statNames = Object.keys(statElements);
    const targetStat = statNames[getRandomInt(0, statNames.length - 1)];
    const [minPenalty, maxPenalty] = difficulty.sideEffectRange;
    const penalty = -getRandomInt(minPenalty, maxPenalty);
    adjusted[targetStat] = (adjusted[targetStat] || 0) + penalty;
  }

  return adjusted;
}

function openDifficultyModal() {
  difficultyModal.classList.add("active");
}

function closeDifficultyModal() {
  difficultyModal.classList.remove("active");
}

function selectDifficulty(level) {
  if (!DIFFICULTY_LEVELS[level]) {
    return;
  }

  currentDifficulty = level;
  confirmDifficultyButton.disabled = false;

  difficultyOptions.forEach((button) => {
    button.classList.toggle("selected", button.dataset.difficulty === level);
  });

  updateSelectedDifficultyLabel();
}

function updateSelectedDifficultyLabel() {
  if (!currentDifficulty) {
    selectedDifficultyLabel.textContent = "난이도: 선택 필요";
    return;
  }

  selectedDifficultyLabel.textContent = `난이도: ${DIFFICULTY_LEVELS[currentDifficulty].label}`;
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function getStatLabel(name) {
  const labels = {
    environment: "환경",
    finance: "제정",
    happiness: "행복",
    development: "발전",
  };

  return labels[name] || name;
}

function calculateInfrastructureScore() {
  return clamp(Math.round(stats.finance * 0.45 + stats.development * 0.55));
}

function calculateRoundIncome(developmentValue) {
  return Math.round(developmentValue * 0.5);
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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resolveApiBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:3100";
  }

  if (typeof import.meta !== "undefined" && import.meta.env && typeof import.meta.env.VITE_API_BASE_URL === "string") {
    const envBase = sanitizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
    if (envBase) {
      return envBase;
    }
  }

  if (typeof window.CITY_API_BASE_URL === "string" && window.CITY_API_BASE_URL.trim()) {
    return sanitizeApiBaseUrl(window.CITY_API_BASE_URL);
  }

  const storedBase = window.localStorage.getItem("CITY_API_BASE_URL");
  if (storedBase && storedBase.trim()) {
    return sanitizeApiBaseUrl(storedBase);
  }

  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3100";
  }

  return "/_/backend";
}

function buildApiBaseCandidates(baseUrl) {
  const normalized = String(baseUrl || "").trim().replace(/\/+$/, "");

  if (!normalized) {
    return ["/_/backend"];
  }

  if (normalized === "/_/backend") {
    return ["/_/backend"];
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return [normalized];
  }

  return normalized.startsWith("/") ? [normalized, "/_/backend"] : [normalized];
}

async function requestApi(pathname, options) {
  let lastError = null;
  let lastResponse = null;

  for (const base of API_BASE_CANDIDATES) {
    const url = `${base}${pathname}`;

    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response;
      }

      lastResponse = response;
      continue;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw new Error("API request failed");
}

function formatApiBaseCandidates(candidates) {
  return candidates.map((base) => (base ? base : "/")).join(", ");
}

function sanitizeApiBaseUrl(rawValue) {
  const value = String(rawValue || "").trim().replace(/\/+$/, "");
  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("localhost") || value.startsWith("127.0.0.1")) {
    return `http://${value}`;
  }

  return `https://${value}`;
}

function getDifficultyBonus(level) {
  if (level === "hard") {
    return 80;
  }

  if (level === "normal") {
    return 40;
  }

  return 0;
}

function getDifficultyGuideText(level) {
  if (level === "easy") {
    return "효과 방향이 보입니다. 선택 뒤에는 발전도 절반만큼 제정이 회복됩니다.";
  }

  if (level === "normal") {
    return "수치가 숨겨지고 결과가 조금 흔들립니다. 제정과 행복의 균형을 신경 써 보세요.";
  }

  if (level === "hard") {
    return "효과 정보가 거의 숨겨집니다. 큰 위기가 나오니 제정 여력을 남겨두는 편이 안전합니다.";
  }

  return "선택 결과가 적용된 뒤 발전도에 따라 제정이 일부 회복됩니다.";
}
