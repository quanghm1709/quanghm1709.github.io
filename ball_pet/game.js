"use strict";

const STORAGE_KEY = "ballBuddySave_v1";
const TICK_MS = 1000;
const MAX_OFFLINE_SECONDS = 8 * 60 * 60;

const PLOT_CONFIG = [
  { unlockCost: 0, growSeconds: 12, yieldMin: 1, yieldMax: 2 },
  { unlockCost: 20, growSeconds: 16, yieldMin: 1, yieldMax: 3 },
  { unlockCost: 50, growSeconds: 20, yieldMin: 2, yieldMax: 3 },
  { unlockCost: 100, growSeconds: 24, yieldMin: 2, yieldMax: 4 },
  { unlockCost: 180, growSeconds: 28, yieldMin: 3, yieldMax: 4 },
  { unlockCost: 300, growSeconds: 34, yieldMin: 3, yieldMax: 5 }
];

const ENEMY_NAMES = [
  "Bóng Hoang", "Cầu Gai", "Bóng Mực", "Orb-01", "Bọt Đỏ", "Cầu Sắt", "Bóng Tinh Nghịch"
];

const EVOLUTION_LIBRARY = {
  orbitRing: {
    id: "orbitRing", icon: "🔺", name: "Vòng Tam Giác Đôi",
    description: "Hai tam giác bay quanh Mochi, có cơ hội tạo một đòn phụ.",
    effectText: "+2 tam giác · +2 ATK",
    apply(state) { state.evolutions.orbitTriangles += 2; state.bonus.atk += 2; }
  },
  ironShell: {
    id: "ironShell", icon: "🛡️", name: "Vỏ Hợp Kim",
    description: "Lớp vỏ dày hấp thụ lực va chạm từ đối thủ.",
    effectText: "+3 DEF · +8 HP",
    apply(state) { state.bonus.def += 3; state.bonus.hp += 8; }
  },
  vitalityCore: {
    id: "vitalityCore", icon: "💚", name: "Lõi Sinh Lực",
    description: "Lõi mềm phát sáng giúp Mochi bền bỉ hơn trong đấu trường.",
    effectText: "+18 HP",
    apply(state) { state.bonus.hp += 18; }
  },
  triadOrbit: {
    id: "triadOrbit", icon: "🔺", name: "Bộ Ba Quỹ Đạo",
    description: "Bổ sung thêm một tam giác và tăng tỉ lệ gây đòn phụ.",
    effectText: "+1 tam giác · +3 ATK",
    apply(state) { state.evolutions.orbitTriangles += 1; state.bonus.atk += 3; }
  },
  rageLens: {
    id: "rageLens", icon: "👁️", name: "Thấu Kính Cuồng Nộ",
    description: "Tập trung động năng vào cú lao, tăng sát thương cơ bản.",
    effectText: "+5 ATK",
    apply(state) { state.bonus.atk += 5; }
  },
  shieldCore: {
    id: "shieldCore", icon: "🔷", name: "Lõi Phản Lực",
    description: "Gia cố thân bóng và giảm sát thương từ các đòn đánh thường.",
    effectText: "+4 DEF · +5 HP",
    apply(state) { state.bonus.def += 4; state.bonus.hp += 5; }
  },
  diamondCannon: {
    id: "diamondCannon", icon: "💠", name: "Pháo Hình Thoi",
    description: "Mỗi 3 lượt bắn một viên đạn xuyên giáp vào đối thủ.",
    effectText: "Mở khóa đạn hình thoi · +2 ATK",
    apply(state) { state.evolutions.diamondCannon = true; state.bonus.atk += 2; }
  },
  regenGel: {
    id: "regenGel", icon: "🧪", name: "Gel Tái Tạo",
    description: "Mỗi 3 lượt hồi một phần HP đã mất trong chiến đấu.",
    effectText: "Hồi HP định kỳ · +10 HP",
    apply(state) { state.evolutions.regen = true; state.bonus.hp += 10; }
  },
  guardianHalo: {
    id: "guardianHalo", icon: "🟡", name: "Hào Quang Hộ Vệ",
    description: "Tạo lá chắn đầu trận và làm cơ thể trông rực rỡ hơn.",
    effectText: "Lá chắn 12% HP · +2 DEF",
    apply(state) { state.evolutions.guardianHalo = true; state.bonus.def += 2; }
  },
  prismSpike: {
    id: "prismSpike", icon: "✨", name: "Gai Lăng Kính",
    description: "Tăng mạnh sức tấn công cho các mốc tiến hóa cao.",
    effectText: "+6 ATK",
    apply(state) { state.bonus.atk += 6; }
  },
  fortressLayer: {
    id: "fortressLayer", icon: "🧱", name: "Lớp Pháo Đài",
    description: "Một lựa chọn phòng thủ ổn định cho trận đấu dài.",
    effectText: "+5 DEF · +8 HP",
    apply(state) { state.bonus.def += 5; state.bonus.hp += 8; }
  },
  giantCore: {
    id: "giantCore", icon: "🔴", name: "Đại Lõi",
    description: "Gia tăng giới hạn sinh lực để chống chịu sát thương lớn.",
    effectText: "+24 HP",
    apply(state) { state.bonus.hp += 24; }
  }
};

const fixedEvolutionOffers = {
  5: ["orbitRing", "ironShell", "vitalityCore"],
  10: ["triadOrbit", "rageLens", "shieldCore"],
  15: ["diamondCannon", "regenGel", "guardianHalo"]
};

function defaultState() {
  return {
    version: 1,
    petName: "Mochi",
    gold: 15,
    food: 2,
    level: 1,
    exp: 0,
    satiety: 72,
    energy: 82,
    happiness: 76,
    totalHarvest: 0,
    wins: 0,
    winStreak: 0,
    unlockedPlots: 1,
    plots: PLOT_CONFIG.map((_, index) => ({ unlocked: index === 0, plantedAt: null })),
    bonus: { atk: 0, hp: 0, def: 0 },
    evolutions: { orbitTriangles: 0, diamondCannon: false, regen: false, guardianHalo: false },
    chosenEvolutions: [],
    pendingEvolutionLevels: [],
    lastSeen: Date.now(),
    soundOn: true
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      bonus: { ...base.bonus, ...(parsed.bonus || {}) },
      evolutions: { ...base.evolutions, ...(parsed.evolutions || {}) },
      plots: PLOT_CONFIG.map((_, index) => ({ ...base.plots[index], ...(parsed.plots?.[index] || {}) })),
      chosenEvolutions: Array.isArray(parsed.chosenEvolutions) ? parsed.chosenEvolutions : [],
      pendingEvolutionLevels: Array.isArray(parsed.pendingEvolutionLevels) ? parsed.pendingEvolutionLevels : []
    };
  } catch (error) {
    console.warn("Không thể đọc save, tạo save mới.", error);
    return defaultState();
  }
}

let state = loadState();
let activeTab = "farm";
let currentEnemy = null;
let battle = null;
let battleTimer = null;
let behaviorTimer = null;
let soundContext = null;
let savePulseTimer = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function stats() {
  return {
    atk: 5 + Math.floor(state.level * 1.55) + state.bonus.atk,
    hp: 36 + state.level * 6 + state.bonus.hp,
    def: 1 + Math.floor(state.level * 0.72) + state.bonus.def
  };
}

function expNeeded(level = state.level) {
  return 20 + level * 8 + Math.floor(level * level * 0.7);
}

function saveGame() {
  state.lastSeen = Date.now();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const saveStatus = $("#saveStatus");
    if (saveStatus) {
      saveStatus.textContent = "Đã lưu";
      clearTimeout(savePulseTimer);
      savePulseTimer = setTimeout(() => { saveStatus.textContent = "Lưu tự động"; }, 1100);
    }
  } catch (error) {
    console.error("Không thể lưu game.", error);
    toast("Trình duyệt không cho phép lưu tiến trình.");
  }
}

function applyOfflineProgress() {
  const elapsed = clamp(Math.floor((Date.now() - Number(state.lastSeen || Date.now())) / 1000), 0, MAX_OFFLINE_SECONDS);
  if (elapsed <= 2) return;
  state.satiety = clamp(state.satiety - elapsed * 0.018, 0, 100);
  state.energy = clamp(state.energy - elapsed * 0.009, 0, 100);
  state.happiness = clamp(state.happiness - elapsed * 0.006, 0, 100);
  toast(`Mochi đã chờ bạn ${formatDuration(elapsed)}.`);
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds} giây`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  return `${hours} giờ ${minutes % 60} phút`;
}

function switchTab(tabName) {
  activeTab = tabName;
  $$(".tab-button").forEach(button => button.classList.toggle("active", button.dataset.tab === tabName));
  $$(".tab-panel").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === tabName));
  if (tabName === "playground") triggerBehavior(true);
}

function renderAll() {
  renderHeader();
  renderFarm();
  renderCare();
  renderEvolutionVisuals();
  renderEnemyPreview();
  checkEvolutionQueue();
}

function renderHeader() {
  const needed = expNeeded();
  $("#goldValue").textContent = Math.floor(state.gold);
  $("#foodValue").textContent = Math.floor(state.food);
  $("#levelValue").textContent = state.level;
  $("#petName").textContent = state.petName;
  $("#expText").textContent = `${Math.floor(state.exp)} / ${needed}`;
  $("#expBar").style.width = `${clamp(state.exp / needed * 100, 0, 100)}%`;
  $("#petMoodText").textContent = getMoodText();
  $("#soundToggle").textContent = state.soundOn ? "🔊" : "🔇";
}

function getMoodText() {
  if (state.satiety < 20) return "Đang rất đói và nhìn về phía bát ăn.";
  if (state.energy < 18) return "Mí mắt nặng trĩu, Mochi cần đi ngủ.";
  if (state.happiness < 25) return "Có vẻ hơi buồn, hãy chơi hoặc vuốt ve Mochi.";
  if (state.satiety > 90) return "Đang no căng và lăn chậm rãi quanh sân.";
  return "Đang tò mò nhìn quanh sân.";
}

function renderFarm() {
  const farmGrid = $("#farmGrid");
  farmGrid.innerHTML = "";
  state.plots.forEach((plot, index) => {
    const config = PLOT_CONFIG[index];
    const card = document.createElement("article");
    card.className = `plot-card ${plot.unlocked ? "" : "locked"}`;

    if (!plot.unlocked) {
      card.innerHTML = `
        <div class="plot-top"><strong>Mảnh đất ${index + 1}</strong><span>Đã khóa</span></div>
        <div class="lock-icon">🔒</div>
        <div class="plot-status">Mở khóa để trồng cây năng suất cao hơn.</div>
        <button class="plot-button" data-action="unlock" data-index="${index}">Mở bằng ${config.unlockCost} 🪙</button>`;
    } else if (!plot.plantedAt) {
      card.innerHTML = `
        <div class="plot-top"><strong>Mảnh đất ${index + 1}</strong><span>${config.growSeconds}s · ${config.yieldMin}-${config.yieldMax} khối</span></div>
        <div class="soil"></div>
        <div class="plot-status">Đất đang trống và sẵn sàng gieo hạt.</div>
        <button class="plot-button" data-action="plant" data-index="${index}">Gieo Khối Mầm</button>`;
    } else {
      const elapsed = (Date.now() - plot.plantedAt) / 1000;
      const progress = clamp(elapsed / config.growSeconds, 0, 1);
      const ready = progress >= 1;
      const remaining = Math.max(0, Math.ceil(config.growSeconds - elapsed));
      card.innerHTML = `
        <div class="plot-top"><strong>Mảnh đất ${index + 1}</strong><span>${ready ? "Sẵn sàng" : `Còn ${remaining}s`}</span></div>
        <div class="soil"><div class="seed-cube" style="--growth:${(0.3 + progress * 0.75).toFixed(2)}"><i class="seed-smile"></i></div></div>
        <div class="progress-track plot-progress"><div class="progress-fill satiety-fill" style="width:${progress * 100}%"></div></div>
        <div class="plot-status">${ready ? "Khối Mầm đã chín. Thu hoạch ngay!" : "Khối Mầm đang hấp thụ ánh sáng."}</div>
        <button class="plot-button ${ready ? "harvest" : ""}" data-action="${ready ? "harvest" : "wait"}" data-index="${index}" ${ready ? "" : "disabled"}>${ready ? "Thu hoạch" : "Đang lớn..."}</button>`;
    }
    farmGrid.appendChild(card);
  });

  $("#unlockedPlotText").textContent = `${state.plots.filter(plot => plot.unlocked).length} / ${state.plots.length}`;
  $("#totalHarvestText").textContent = state.totalHarvest;
}

function handleFarmAction(action, index) {
  const plot = state.plots[index];
  const config = PLOT_CONFIG[index];
  if (!plot || !config) return;

  if (action === "unlock") {
    if (state.gold < config.unlockCost) {
      toast(`Bạn cần thêm ${config.unlockCost - state.gold} vàng.`);
      beep("error");
      return;
    }
    state.gold -= config.unlockCost;
    plot.unlocked = true;
    state.unlockedPlots = state.plots.filter(item => item.unlocked).length;
    toast(`Đã mở mảnh đất ${index + 1}!`);
    beep("success");
  }

  if (action === "plant" && plot.unlocked && !plot.plantedAt) {
    plot.plantedAt = Date.now();
    toast("Đã gieo một Khối Mầm.");
    beep("tap");
  }

  if (action === "harvest" && plot.plantedAt) {
    const elapsed = (Date.now() - plot.plantedAt) / 1000;
    if (elapsed < config.growSeconds) return;
    const amount = randomInt(config.yieldMin, config.yieldMax);
    state.food += amount;
    state.totalHarvest += amount;
    plot.plantedAt = null;
    addExp(2 + amount, "thu hoạch");
    toast(`Thu hoạch được ${amount} Khối Thức Ăn.`);
    beep("harvest");
  }

  saveGame();
  renderAll();
}

function renderCare() {
  const currentStats = stats();
  $("#satietyText").textContent = `${Math.round(state.satiety)}%`;
  $("#energyText").textContent = `${Math.round(state.energy)}%`;
  $("#happinessText").textContent = `${Math.round(state.happiness)}%`;
  $("#satietyBar").style.width = `${state.satiety}%`;
  $("#energyBar").style.width = `${state.energy}%`;
  $("#happinessBar").style.width = `${state.happiness}%`;
  $("#atkValue").textContent = currentStats.atk;
  $("#hpValue").textContent = currentStats.hp;
  $("#defValue").textContent = currentStats.def;
  $("#feedButton").disabled = state.food <= 0 || state.satiety > 86;
  $("#playButton").disabled = state.energy < 12 || state.happiness > 95;
  $("#sleepButton").disabled = state.energy > 94;
  $("#petButton").disabled = state.happiness > 96;
}

function careAction(type) {
  const petWrap = $("#petWrap");
  petWrap.classList.remove("sleeping", "playing");

  if (type === "feed") {
    if (state.food <= 0) return toast("Nông trại chưa có thức ăn.");
    if (state.satiety > 86) return toast("Mochi đang quá no, không thể ăn thêm.");
    state.food -= 1;
    state.satiety = clamp(state.satiety + 24, 0, 100);
    state.happiness = clamp(state.happiness + 4, 0, 100);
    addExp(7, "cho ăn");
    setSpeech("Ngon quá! 🟩");
    bouncePet();
    beep("success");
  }

  if (type === "play") {
    if (state.energy < 12) return toast("Mochi quá mệt để chơi.");
    state.energy = clamp(state.energy - 12, 0, 100);
    state.happiness = clamp(state.happiness + 18, 0, 100);
    state.satiety = clamp(state.satiety - 4, 0, 100);
    addExp(6, "vui chơi");
    petWrap.classList.add("playing");
    setSpeech("Bắt được tôi không? ⚽");
    beep("play");
    setTimeout(() => petWrap.classList.remove("playing"), 1700);
  }

  if (type === "sleep") {
    if (state.energy > 94) return toast("Mochi vẫn còn đầy năng lượng.");
    state.energy = clamp(state.energy + 36, 0, 100);
    state.satiety = clamp(state.satiety - 5, 0, 100);
    state.happiness = clamp(state.happiness + 3, 0, 100);
    addExp(4, "nghỉ ngơi");
    petWrap.classList.add("sleeping");
    setSpeech("Zzz... 🌙");
    beep("sleep");
    setTimeout(() => petWrap.classList.remove("sleeping"), 2600);
  }

  if (type === "pet") {
    if (state.happiness > 96) return toast("Mochi đang cực kỳ vui rồi.");
    state.happiness = clamp(state.happiness + 9, 0, 100);
    addExp(2, "vuốt ve");
    setSpeech("Thích quá! 💛");
    bouncePet();
    beep("tap");
  }

  saveGame();
  renderAll();
}

function bouncePet() {
  const ball = $("#playgroundBall");
  ball.animate([
    { transform: "translateY(0) scale(1)" },
    { transform: "translateY(-30px) scale(1.04, .96)" },
    { transform: "translateY(0) scale(.96, 1.04)" },
    { transform: "translateY(0) scale(1)" }
  ], { duration: 650, easing: "ease-out" });
}

function setSpeech(message) {
  $("#petSpeech").textContent = message;
}

function triggerBehavior(force = false) {
  if (!force && activeTab !== "playground") return;
  const petWrap = $("#petWrap");
  if (!petWrap) return;
  petWrap.classList.remove("sleeping", "playing");

  if (state.energy < 16) {
    petWrap.classList.add("sleeping");
    setSpeech("Mệt quá... Zzz");
    return;
  }

  const x = randomInt(22, 76);
  const y = randomInt(48, 72);
  petWrap.style.left = `${x}%`;
  petWrap.style.top = `${y}%`;

  const messages = state.satiety < 28
    ? ["Tôi hơi đói...", "Có Khối Thức Ăn không?", "Bụng đang kêu rồi!"]
    : ["Đi dạo một vòng!", "Sân hôm nay đẹp quá.", "Mochi đang khám phá.", "Lăn... lăn... lăn..."];
  setSpeech(messages[randomInt(0, messages.length - 1)]);
}

function passiveTick() {
  if (!battle) {
    state.satiety = clamp(state.satiety - 0.018, 0, 100);
    state.energy = clamp(state.energy - 0.009, 0, 100);
    state.happiness = clamp(state.happiness - 0.006, 0, 100);
  }
  renderHeader();
  renderCare();
  renderFarm();
  if (Date.now() % 10000 < 1100) saveGame();
}

function addExp(amount, source = "hoạt động") {
  state.exp += amount;
  let levelsGained = 0;
  while (state.exp >= expNeeded()) {
    state.exp -= expNeeded();
    state.level += 1;
    levelsGained += 1;
    state.satiety = clamp(state.satiety + 10, 0, 100);
    state.energy = clamp(state.energy + 12, 0, 100);
    state.happiness = clamp(state.happiness + 10, 0, 100);
    if (state.level % 5 === 0 && !state.pendingEvolutionLevels.includes(state.level)) {
      state.pendingEvolutionLevels.push(state.level);
    }
  }
  if (levelsGained > 0) {
    toast(`Mochi đã lên Lv.${state.level}!`);
    beep("level");
  } else if (amount >= 4) {
    toast(`+${amount} EXP từ ${source}.`);
  }
}

function checkEvolutionQueue() {
  if (battle || !state.pendingEvolutionLevels.length) return;
  const modal = $("#evolutionModal");
  if (!modal.classList.contains("hidden")) return;
  showEvolutionModal(state.pendingEvolutionLevels[0]);
}

function evolutionOfferForLevel(level) {
  if (fixedEvolutionOffers[level]) return fixedEvolutionOffers[level];
  const latePool = ["prismSpike", "fortressLayer", "giantCore", "rageLens", "shieldCore", "regenGel"];
  const available = latePool.filter(id => !state.chosenEvolutions.includes(`${level}:${id}`));
  return shuffle([...available]).slice(0, 3);
}

function showEvolutionModal(level) {
  const options = evolutionOfferForLevel(level);
  $("#evolutionTitle").textContent = `${state.petName} đã đạt Lv.${level}!`;
  const grid = $("#evolutionOptions");
  grid.innerHTML = "";
  options.forEach(id => {
    const evolution = EVOLUTION_LIBRARY[id];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "evolution-card";
    button.innerHTML = `
      <div class="evolution-icon">${evolution.icon}</div>
      <h3>${evolution.name}</h3>
      <p>${evolution.description}</p>
      <strong>${evolution.effectText}</strong>`;
    button.addEventListener("click", () => chooseEvolution(level, id));
    grid.appendChild(button);
  });
  $("#evolutionModal").classList.remove("hidden");
}

function chooseEvolution(level, evolutionId) {
  const evolution = EVOLUTION_LIBRARY[evolutionId];
  if (!evolution) return;
  evolution.apply(state);
  state.chosenEvolutions.push(`${level}:${evolutionId}`);
  state.pendingEvolutionLevels = state.pendingEvolutionLevels.filter(item => item !== level);
  $("#evolutionModal").classList.add("hidden");
  toast(`Đã nhận ${evolution.name}!`);
  beep("level");
  saveGame();
  renderAll();
  setTimeout(checkEvolutionQueue, 350);
}

function renderEvolutionVisuals() {
  [$("#playgroundOrbit"), $("#arenaOrbit")].forEach(layer => {
    layer.innerHTML = "";
    const count = state.evolutions.orbitTriangles;
    for (let index = 0; index < count; index += 1) {
      const triangle = document.createElement("i");
      triangle.className = "orbit-triangle";
      const angle = count ? (360 / count) * index : 0;
      const radius = 76;
      const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
      const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
      triangle.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
      layer.appendChild(triangle);
    }
  });
  $("#playgroundCannon").classList.toggle("hidden", !state.evolutions.diamondCannon);
  $("#arenaCannon").classList.toggle("hidden", !state.evolutions.diamondCannon);
  [$("#playgroundBall"), $(".player-ball")].forEach(ball => {
    ball.style.boxShadow = state.evolutions.guardianHalo
      ? "0 0 0 8px rgba(255, 215, 94, .25), 0 0 28px rgba(255, 215, 94, .65), inset -13px -17px 0 rgba(54,34,140,.23)"
      : "";
  });
}

function generateEnemy() {
  const levelVariance = randomInt(-1, 1);
  const level = clamp(state.level + levelVariance, 1, state.level + 2);
  const difficulty = 0.9 + Math.random() * 0.22;
  const hue = randomInt(0, 359);
  currentEnemy = {
    name: ENEMY_NAMES[randomInt(0, ENEMY_NAMES.length - 1)],
    level,
    atk: Math.max(3, Math.round((4 + level * 1.45) * difficulty)),
    hp: Math.round((32 + level * 6.2) * difficulty),
    def: Math.max(0, Math.round((0.5 + level * 0.65) * difficulty)),
    hue
  };
  renderEnemyPreview();
}

function renderEnemyPreview() {
  if (!currentEnemy) generateEnemy();
  $("#enemyPreviewName").textContent = `${currentEnemy.name} Lv.${currentEnemy.level}`;
  $("#enemyPreviewStats").textContent = `ATK ${currentEnemy.atk} · HP ${currentEnemy.hp} · DEF ${currentEnemy.def}`;
  $("#enemyName").textContent = currentEnemy.name;
  $("#enemyBall").style.background = `radial-gradient(circle at 30% 25%, hsl(${currentEnemy.hue} 90% 91%) 0 12%, hsl(${currentEnemy.hue} 78% 62%) 35%, hsl(${currentEnemy.hue} 68% 37%) 72%)`;
  if (!battle) {
    $("#enemyBattleHpText").textContent = `HP ${currentEnemy.hp} / ${currentEnemy.hp}`;
    $("#enemyBattleHpBar").style.width = "100%";
    const currentStats = stats();
    $("#playerBattleHpText").textContent = `HP ${currentStats.hp} / ${currentStats.hp}`;
    $("#playerBattleHpBar").style.width = "100%";
  }
}

function startBattle() {
  if (battle) return;
  const playerStats = stats();
  const playerShield = state.evolutions.guardianHalo ? Math.round(playerStats.hp * 0.12) : 0;
  battle = {
    turn: 0,
    player: { ...playerStats, currentHp: playerStats.hp, shield: playerShield },
    enemy: { ...currentEnemy, currentHp: currentEnemy.hp },
    playerTurn: true
  };
  $("#battleLog").innerHTML = "";
  logBattle(`Trận đấu bắt đầu với ${currentEnemy.name} Lv.${currentEnemy.level}.`, "special");
  if (playerShield > 0) logBattle(`Hào Quang tạo lá chắn ${playerShield} HP.`, "special");
  setBattleControls(true);
  updateBattleUI();
  battleTimer = setInterval(battleStep, 720);
  beep("battle");
}

function battleStep() {
  if (!battle) return;
  battle.turn += battle.playerTurn ? 1 : 0;

  if (battle.playerTurn) {
    animateAttack("player");
    let damage = calculateDamage(battle.player.atk, battle.enemy.def);
    battle.enemy.currentHp = clamp(battle.enemy.currentHp - damage, 0, battle.enemy.hp);
    logBattle(`Mochi lao vào gây ${damage} sát thương.`, "good");

    if (state.evolutions.orbitTriangles > 0 && Math.random() < Math.min(0.22 + state.evolutions.orbitTriangles * 0.06, 0.55) && battle.enemy.currentHp > 0) {
      const bonusDamage = Math.max(1, Math.round(battle.player.atk * 0.48));
      battle.enemy.currentHp = clamp(battle.enemy.currentHp - bonusDamage, 0, battle.enemy.hp);
      logBattle(`${state.evolutions.orbitTriangles} tam giác quỹ đạo chém thêm ${bonusDamage} sát thương.`, "special");
    }

    if (state.evolutions.diamondCannon && battle.turn % 3 === 0 && battle.enemy.currentHp > 0) {
      fireDiamond();
      const cannonDamage = Math.max(2, Math.round(battle.player.atk * 0.8) + Math.floor(battle.enemy.def * 0.5));
      battle.enemy.currentHp = clamp(battle.enemy.currentHp - cannonDamage, 0, battle.enemy.hp);
      logBattle(`Pháo Hình Thoi xuyên giáp gây ${cannonDamage} sát thương.`, "special");
    }

    if (state.evolutions.regen && battle.turn % 3 === 0 && battle.player.currentHp > 0) {
      const healed = Math.min(Math.round(battle.player.hp * 0.08), battle.player.hp - battle.player.currentHp);
      if (healed > 0) {
        battle.player.currentHp += healed;
        logBattle(`Gel Tái Tạo hồi ${healed} HP.`, "special");
      }
    }
  } else {
    animateAttack("enemy");
    let damage = calculateDamage(battle.enemy.atk, battle.player.def);
    if (battle.player.shield > 0) {
      const absorbed = Math.min(battle.player.shield, damage);
      battle.player.shield -= absorbed;
      damage -= absorbed;
      logBattle(`Lá chắn hấp thụ ${absorbed} sát thương.`, "special");
    }
    if (damage > 0) {
      battle.player.currentHp = clamp(battle.player.currentHp - damage, 0, battle.player.hp);
      logBattle(`${battle.enemy.name} phản công gây ${damage} sát thương.`, "bad");
    }
  }

  updateBattleUI();

  if (battle.enemy.currentHp <= 0) return finishBattle(true);
  if (battle.player.currentHp <= 0) return finishBattle(false);
  battle.playerTurn = !battle.playerTurn;
}

function calculateDamage(atk, def) {
  const variance = 0.86 + Math.random() * 0.28;
  return Math.max(1, Math.round((atk * variance) - def * 0.62));
}

function animateAttack(side) {
  const attacker = side === "player" ? $("#playerFighter") : $("#enemyFighter");
  const target = side === "player" ? $("#enemyFighter") : $("#playerFighter");
  attacker.classList.add(side === "player" ? "attack-right" : "attack-left");
  setTimeout(() => {
    attacker.classList.remove("attack-right", "attack-left");
    target.classList.add("hit");
    setTimeout(() => target.classList.remove("hit"), 360);
  }, 170);
  beep(side === "player" ? "hit" : "enemyHit");
}

function fireDiamond() {
  const shot = $("#diamondShot");
  shot.classList.remove("fire");
  void shot.offsetWidth;
  shot.classList.add("fire");
  setTimeout(() => shot.classList.remove("fire"), 560);
}

function updateBattleUI() {
  if (!battle) return;
  const playerPercent = battle.player.currentHp / battle.player.hp * 100;
  const enemyPercent = battle.enemy.currentHp / battle.enemy.hp * 100;
  $("#playerBattleHpBar").style.width = `${playerPercent}%`;
  $("#enemyBattleHpBar").style.width = `${enemyPercent}%`;
  $("#playerBattleHpText").textContent = `HP ${battle.player.currentHp} / ${battle.player.hp}${battle.player.shield ? ` · 🛡️ ${battle.player.shield}` : ""}`;
  $("#enemyBattleHpText").textContent = `HP ${battle.enemy.currentHp} / ${battle.enemy.hp}`;
}

function finishBattle(won) {
  clearInterval(battleTimer);
  battleTimer = null;
  if (won) {
    state.wins += 1;
    state.winStreak += 1;
    const goldReward = 8 + currentEnemy.level * 3 + Math.min(state.winStreak, 8);
    const expReward = 7 + currentEnemy.level * 2;
    state.gold += goldReward;
    addExp(expReward, "chiến thắng");
    logBattle(`CHIẾN THẮNG! +${goldReward} vàng, +${expReward} EXP.`, "reward");
    toast(`Thắng trận! Nhận ${goldReward} vàng.`);
    beep("victory");
  } else {
    state.winStreak = 0;
    state.happiness = clamp(state.happiness - 3, 0, 100);
    logBattle("Mochi thua trận nhưng không mất tài nguyên.", "bad");
    toast("Thua trận. Hãy chăm sóc hoặc nâng cấp Mochi!");
    beep("error");
  }
  battle = null;
  setBattleControls(false);
  saveGame();
  renderAll();
  setTimeout(() => {
    generateEnemy();
    checkEvolutionQueue();
  }, 900);
}

function setBattleControls(isBattling) {
  $("#startBattleButton").disabled = isBattling;
  $("#rerollEnemyButton").disabled = isBattling;
  $("#startBattleButton").textContent = isBattling ? "Đang chiến đấu..." : "Tìm đối thủ & chiến đấu";
}

function logBattle(message, className = "") {
  const log = $("#battleLog");
  const p = document.createElement("p");
  p.textContent = message;
  if (className) p.className = className;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

function shuffle(array) {
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
  return array;
}

function toast(message) {
  const stack = $("#toastStack");
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  stack.appendChild(item);
  setTimeout(() => item.remove(), 2900);
}

function beep(type) {
  if (!state.soundOn) return;
  try {
    soundContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = soundContext.createOscillator();
    const gain = soundContext.createGain();
    const settings = {
      tap: [330, 0.045], success: [520, 0.08], harvest: [680, 0.1], play: [420, 0.09],
      sleep: [210, 0.12], battle: [240, 0.12], hit: [150, 0.055], enemyHit: [120, 0.055],
      victory: [760, 0.18], level: [880, 0.2], error: [95, 0.1]
    }[type] || [300, 0.06];
    oscillator.type = type === "error" ? "sawtooth" : "sine";
    oscillator.frequency.value = settings[0];
    gain.gain.setValueAtTime(0.0001, soundContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, soundContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, soundContext.currentTime + settings[1]);
    oscillator.connect(gain).connect(soundContext.destination);
    oscillator.start();
    oscillator.stop(soundContext.currentTime + settings[1] + 0.02);
  } catch (error) {
    console.debug("Âm thanh không khả dụng.", error);
  }
}

function resetGame() {
  const confirmed = window.confirm("Xóa toàn bộ tiến trình và bắt đầu lại?");
  if (!confirmed) return;
  clearInterval(battleTimer);
  battle = null;
  state = defaultState();
  currentEnemy = null;
  localStorage.removeItem(STORAGE_KEY);
  generateEnemy();
  renderAll();
  saveGame();
  toast("Đã tạo tiến trình mới.");
}

function bindEvents() {
  $$(".tab-button").forEach(button => button.addEventListener("click", () => switchTab(button.dataset.tab)));
  $("#farmGrid").addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button || button.disabled) return;
    handleFarmAction(button.dataset.action, Number(button.dataset.index));
  });
  $("#feedButton").addEventListener("click", () => careAction("feed"));
  $("#playButton").addEventListener("click", () => careAction("play"));
  $("#sleepButton").addEventListener("click", () => careAction("sleep"));
  $("#petButton").addEventListener("click", () => careAction("pet"));
  $("#startBattleButton").addEventListener("click", startBattle);
  $("#rerollEnemyButton").addEventListener("click", () => { generateEnemy(); beep("tap"); });
  $("#soundToggle").addEventListener("click", () => { state.soundOn = !state.soundOn; saveGame(); renderHeader(); if (state.soundOn) beep("success"); });
  $("#resetButton").addEventListener("click", resetGame);
  window.addEventListener("beforeunload", saveGame);
  document.addEventListener("visibilitychange", () => { if (document.hidden) saveGame(); });
}

function init() {
  applyOfflineProgress();
  bindEvents();
  generateEnemy();
  renderAll();
  behaviorTimer = setInterval(() => triggerBehavior(), 4300);
  setInterval(passiveTick, TICK_MS);
  saveGame();
}

init();
