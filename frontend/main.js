const API_BASE_URL = resolveApiBaseUrl();
const API_BASE_CANDIDATES = buildApiBaseCandidates(API_BASE_URL);

const QUESTION_SETS = {
  easy: [
    {
      prompt: "등교 시간 학교 앞이 자주 막힙니다",
      choices: [
        {
          text: "학교 앞 300m 구간에 보행 우선 신호를 도입한다",
          effects: { transport: 7, happiness: 7, environment: 2 },
        },
        {
          text: "학부모 차량 임시 정차 구역을 새로 만든다",
          effects: { transport: 5, development: 4, environment: -2 },
        },
        {
          text: "통학버스 노선을 늘리고 탑승 안내를 강화한다",
          effects: { transport: 8, happiness: 5, environment: 4 },
        },
      ],
    },
    {
      prompt: "동네 공원이 낡아 시민 이용이 줄었습니다",
      choices: [
        {
          text: "그늘 쉼터와 벤치를 늘린다",
          effects: { happiness: 8, environment: 5, development: -1 },
        },
        {
          text: "야간 조명과 산책로를 정비한다",
          effects: { happiness: 7, transport: 3, development: 2 },
        },
        {
          text: "공원 일부를 주차장으로 전환한다",
          effects: { transport: 5, development: 5, environment: -7, happiness: -2 },
        },
      ],
    },
    {
      prompt: "버스 정류장 환경이 불편하다는 민원이 많습니다",
      choices: [
        {
          text: "정류장에 실시간 도착 안내판을 설치한다",
          effects: { transport: 8, happiness: 4, development: 2 },
        },
        {
          text: "정류장 지붕과 의자를 전면 교체한다",
          effects: { happiness: 8, transport: 4, development: 1 },
        },
        {
          text: "예산 절감을 위해 최소 보수만 진행한다",
          effects: { development: 3, transport: 1, happiness: -4 },
        },
      ],
    },
    {
      prompt: "도심 미세먼지 수치가 최근 상승했습니다",
      choices: [
        {
          text: "대기오염 취약 구역에 가로수를 추가 식재한다",
          effects: { environment: 9, happiness: 4, development: -1 },
        },
        {
          text: "친환경 청소차와 물청소 주기를 늘린다",
          effects: { environment: 8, transport: 3, happiness: 2 },
        },
        {
          text: "산업 물류 차량 통행을 허용해 물량을 맞춘다",
          effects: { development: 7, environment: -7, happiness: -2 },
        },
      ],
    },
    {
      prompt: "주말마다 시민들이 여가공간 부족을 호소합니다",
      choices: [
        {
          text: "하천변에 소규모 휴식공간을 만든다",
          effects: { happiness: 9, environment: 6, development: -1 },
        },
        {
          text: "주민센터 유휴공간을 문화공간으로 바꾼다",
          effects: { happiness: 8, development: 3, transport: 2 },
        },
        {
          text: "상업시설 확장으로 소비 편의를 우선한다",
          effects: { development: 8, happiness: 1, environment: -4 },
        },
      ],
    },
    {
      prompt: "올해 예산이 줄어 우선 사업을 정해야 합니다",
      choices: [
        {
          text: "노후 시설 안전 점검과 보수에 집중한다",
          effects: { transport: 6, happiness: 5, development: 2 },
        },
        {
          text: "기초 복지와 생활환경 개선을 우선한다",
          effects: { happiness: 7, environment: 5, development: -1 },
        },
        {
          text: "개발 사업 중심으로 세수 확대를 노린다",
          effects: { development: 8, transport: 2, environment: -4, happiness: -2 },
        },
      ],
    },
  ],
  normal: [
    {
      prompt: "출근 시간(07:30~09:30) 중앙대로 평균 통행속도가 시속 16km로 떨어졌습니다",
      choices: [
        {
          text: "중앙대로 2km 구간에 버스전용차로를 설치한다",
          effects: { transport: 11, environment: 4, happiness: 2, development: -2 },
        },
        {
          text: "교차로 6곳 신호를 재설계해 직진 흐름을 우선한다",
          effects: { transport: 8, development: 5, environment: -4, happiness: -1 },
        },
        {
          text: "도심 주차요금을 2배 인상하고 환승주차장을 늘린다",
          effects: { transport: 7, environment: 6, happiness: -3, development: 1 },
        },
      ],
    },
    {
      prompt: "여름철 폭염일수가 늘어 보행자 열사병 신고가 급증했습니다",
      choices: [
        {
          text: "초등학교 주변 12개 블록에 그늘수목을 집중 식재한다",
          effects: { environment: 10, happiness: 8, development: -2 },
        },
        {
          text: "보행로 바닥을 고반사 포장으로 교체한다",
          effects: { environment: 7, transport: 2, happiness: 5, development: 1 },
        },
        {
          text: "냉방 지원 예산을 확대하고 녹지 사업은 축소한다",
          effects: { happiness: 6, development: 4, environment: -6 },
        },
      ],
    },
    {
      prompt: "대중교통 순환율이 낮아 환승 대기 불만이 커졌습니다",
      choices: [
        {
          text: "버스 도착정보 오차를 줄이는 통합 관제 시스템을 구축한다",
          effects: { transport: 10, happiness: 5, development: 3 },
        },
        {
          text: "지하철 환승 동선을 개편해 도보 이동거리를 줄인다",
          effects: { transport: 8, happiness: 7, development: -1 },
        },
        {
          text: "혼잡 노선 대신 외곽 신규노선 확장에 집중한다",
          effects: { development: 9, transport: 4, happiness: -2, environment: -3 },
        },
      ],
    },
    {
      prompt: "산업단지 인근 PM2.5 수치가 권고 기준을 반복 초과했습니다",
      choices: [
        {
          text: "배출량 상위 공장 20곳에 저감설비 의무화를 시행한다",
          effects: { environment: 12, development: -4, happiness: 3 },
        },
        {
          text: "산업단지 물류를 철도 중심으로 전환한다",
          effects: { environment: 9, transport: 6, development: -2, happiness: 1 },
        },
        {
          text: "규제를 완화해 공장 가동률을 우선 회복한다",
          effects: { development: 11, environment: -9, happiness: -2 },
        },
      ],
    },
    {
      prompt: "청년층 이주율이 떨어져 도심 공동화 조짐이 나타났습니다",
      choices: [
        {
          text: "공공임대 주택과 창업공간을 결합한 복합지구를 조성한다",
          effects: { happiness: 8, development: 8, environment: -2 },
        },
        {
          text: "소규모 문화공간과 야간 대중교통을 동시에 확대한다",
          effects: { happiness: 10, transport: 6, development: 2 },
        },
        {
          text: "민간 대형 상업시설 유치에 행정 자원을 집중한다",
          effects: { development: 10, happiness: -3, environment: -4 },
        },
      ],
    },
    {
      prompt: "재정 여력이 줄어 내년도 도시 예산을 선택과 집중해야 합니다",
      choices: [
        {
          text: "노후 상하수도와 도로 유지보수에 우선 배정한다",
          effects: { transport: 7, happiness: 5, development: 2 },
        },
        {
          text: "기후 대응 인프라(빗물저류·도심숲)를 우선 투자한다",
          effects: { environment: 11, happiness: 6, development: -3 },
        },
        {
          text: "세금 인상 없이 민간투자 사업으로만 추진한다",
          effects: { development: 9, transport: 3, environment: -5, happiness: -2 },
        },
      ],
    },
  ],
  hard: [
    {
      prompt: "광역철도 연계사업과 도심 재개발 일정이 충돌해 교통혼잡과 상권 반발이 동시에 커졌습니다",
      choices: [
        {
          text: "재개발 일정 일부를 연기하고 환승체계부터 완성한다",
          effects: { transport: 12, happiness: 4, development: -4 },
        },
        {
          text: "공사를 병행하되 공사구간 통행료를 탄력 적용한다",
          effects: { transport: 7, development: 7, happiness: -3, environment: -2 },
        },
        {
          text: "재개발을 우선해 세수 확보 후 교통대책을 추진한다",
          effects: { development: 11, transport: -2, happiness: -4, environment: -3 },
        },
      ],
    },
    {
      prompt: "폭우 빈도가 높아져 상습 침수지와 열섬 지역이 겹치는 복합 재난 위험이 증가했습니다",
      choices: [
        {
          text: "침수저감 인프라와 도심숲을 묶은 복합 사업으로 전환한다",
          effects: { environment: 12, happiness: 5, development: -3, transport: 2 },
        },
        {
          text: "배수관 확충에 집중하고 녹지 조성은 민간에 맡긴다",
          effects: { transport: 8, development: 6, environment: -3, happiness: -1 },
        },
        {
          text: "재난 대응 예산을 분산 집행해 단기 민원부터 처리한다",
          effects: { happiness: 2, development: 3, environment: -5, transport: -2 },
        },
      ],
    },
    {
      prompt: "대중교통 적자가 누적되며 요금 인상 요구와 서비스 질 하락이 동시에 발생했습니다",
      choices: [
        {
          text: "요금은 동결하고 혼잡 노선에만 선택적 증편을 시행한다",
          effects: { happiness: 6, transport: 7, development: -2 },
        },
        {
          text: "요금을 인상하되 저소득층 이동 바우처를 도입한다",
          effects: { development: 5, transport: 6, happiness: -1, environment: 2 },
        },
        {
          text: "요금 정상화와 민간 위탁 확대를 동시에 추진한다",
          effects: { development: 9, transport: 4, happiness: -4, environment: -2 },
        },
      ],
    },
    {
      prompt: "산업단지 고용 유지를 위해 규제 완화 압박이 커졌지만 건강영향 조사 결과는 악화 추세입니다",
      choices: [
        {
          text: "강한 배출 규제를 유지하고 친환경 전환 보조금을 연계한다",
          effects: { environment: 11, happiness: 4, development: -3 },
        },
        {
          text: "규제 유예를 허용하되 주민 모니터링 위원회를 구성한다",
          effects: { development: 6, happiness: 1, environment: -3, transport: 2 },
        },
        {
          text: "규제를 일괄 완화해 단기 고용 지표를 방어한다",
          effects: { development: 12, environment: -10, happiness: -3 },
        },
      ],
    },
    {
      prompt: "구도심 공동화와 외곽 난개발이 동시에 진행되며 생활권 불균형이 심화되고 있습니다",
      choices: [
        {
          text: "구도심 생활SOC와 공공주택을 결합한 재생축을 만든다",
          effects: { happiness: 8, development: 6, environment: 3, transport: 2 },
        },
        {
          text: "외곽 신도시 인허가를 확대해 공급 속도를 높인다",
          effects: { development: 10, transport: 2, environment: -5, happiness: -2 },
        },
        {
          text: "생활권 통합을 위해 핵심 거점만 선택 집중 개발한다",
          effects: { development: 7, transport: 5, happiness: 1, environment: -1 },
        },
      ],
    },
    {
      prompt: "국비 지원 축소로 필수사업을 줄여야 하는데, 시민은 서비스 유지와 세금 동결을 동시에 요구합니다",
      choices: [
        {
          text: "필수 인프라 유지에 집중하고 신규 사업은 전면 재검토한다",
          effects: { transport: 7, happiness: 3, development: -2, environment: 2 },
        },
        {
          text: "탄소 감축 사업만 보호하고 나머지 예산을 단계 축소한다",
          effects: { environment: 10, development: -3, happiness: 2, transport: 1 },
        },
        {
          text: "민자 사업 비중을 높여 단기 재정 부담을 낮춘다",
          effects: { development: 8, transport: 3, environment: -4, happiness: -3 },
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

const PERFECT_ROUTE_CHOICES = {
  easy: [0, 0, 0, 0, 0, 0],
  normal: [0, 0, 0, 0, 0, 0],
  hard: [0, 0, 0, 0, 0, 0],
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
  const isPerfectRoute = isPerfectRouteForRun();
  if (isPerfectRoute) {
    stats = {
      environment: 100,
      transport: 100,
      happiness: 100,
      development: 100,
    };
  }

  const finalType = calculateFinalType();

  progressFill.style.width = "100%";
  resultCityType.textContent = finalType.title;
  resultFeedback.textContent = isPerfectRoute
    ? `${finalType.description} 만점 루트를 달성했습니다.`
    : finalType.description;
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

function hasPerfectRouteForDifficulty(difficulty) {
  const route = PERFECT_ROUTE_CHOICES[difficulty];
  return Array.isArray(route) && route.length === activeQuestions.length;
}

function isPerfectRouteForRun() {
  if (!hasPerfectRouteForDifficulty(currentDifficulty)) {
    return false;
  }

  const route = PERFECT_ROUTE_CHOICES[currentDifficulty];
  if (!Array.isArray(route) || selectedChoiceIndexes.length !== route.length) {
    return false;
  }

  return route.every((expectedIndex, roundIndex) => selectedChoiceIndexes[roundIndex] === expectedIndex);
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
    return ["", "/_/backend"];
  }

  if (normalized === "/_/backend") {
    return ["/_/backend", ""];
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return [normalized];
  }

  return [normalized, "", "/_/backend"];
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

function getDifficultyGuideText(level) {
  if (level === "easy") {
    return "효과 방향(상승/하락)이 보입니다. 입문용으로 가장 직관적입니다.";
  }

  if (level === "normal") {
    return "수치가 숨겨지고 결과가 조금 흔들립니다. 균형 잡힌 플레이에 적합합니다.";
  }

  if (level === "hard") {
    return "효과 정보가 거의 숨겨집니다. 리스크를 감수하고 전략적으로 선택하세요.";
  }

  return "선택하면 즉시 도시 상태가 반영됩니다.";
}
