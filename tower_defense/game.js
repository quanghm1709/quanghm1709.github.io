(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const els = {
    homeScreen: document.getElementById('homeScreen'),
    gameScreen: document.getElementById('gameScreen'),
    levelCards: document.getElementById('levelCards'),
    missionName: document.getElementById('missionName'),
    oreValue: document.getElementById('oreValue'),
    waveValue: document.getElementById('waveValue'),
    baseValue: document.getElementById('baseValue'),
    towerList: document.getElementById('towerList'),
    inspector: document.getElementById('inspector'),
    buildModeBadge: document.getElementById('buildModeBadge'),
    waveBtn: document.getElementById('waveBtn'),
    waveStateLabel: document.getElementById('waveStateLabel'),
    nextWaveText: document.getElementById('nextWaveText'),
    waveProgress: document.getElementById('waveProgress'),
    enemyForecast: document.getElementById('enemyForecast'),
    announcement: document.getElementById('announcement'),
    hoverTip: document.getElementById('hoverTip'),
    homeBtn: document.getElementById('homeBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    speedBtn: document.getElementById('speedBtn'),
    soundBtn: document.getElementById('soundBtn'),
    resultModal: document.getElementById('resultModal'),
    resultBadge: document.getElementById('resultBadge'),
    resultTitle: document.getElementById('resultTitle'),
    resultText: document.getElementById('resultText'),
    resultWaves: document.getElementById('resultWaves'),
    resultKills: document.getElementById('resultKills'),
    resultOre: document.getElementById('resultOre'),
    retryBtn: document.getElementById('retryBtn'),
    resultHomeBtn: document.getElementById('resultHomeBtn')
  };

  const GRID_W = 14;
  const GRID_H = 10;
  const TILE_W = 66;
  const TILE_H = 33;
  const ORIGIN = { x: 590, y: 96 };

  const TOWERS = {
    gatling: {
      name: 'Gatling', symbol: 'G', cost: 90, color: '#70e0ff',
      description: 'Rapid single-target fire.', range: 3.2, damage: 8, fireRate: 0.18, hp: 165
    },
    rocket: {
      name: 'Rocket', symbol: 'R', cost: 165, color: '#ff9a6d',
      description: 'Slow area-damage missiles.', range: 3.9, damage: 38, fireRate: 1.28, hp: 180, aoe: 1.45
    },
    laser: {
      name: 'Laser', symbol: 'L', cost: 135, color: '#d38cff',
      description: 'Slows one target continuously.', range: 3.45, damage: 4.5, fireRate: 0.14, hp: 150, slow: 0.48
    },
    mine: {
      name: 'Ore Mining', symbol: '◆', cost: 120, color: '#ffd26b',
      description: 'Generates ore every few seconds.', range: 0, damage: 0, fireRate: 5.2, hp: 145, income: 24
    },
    engineer: {
      name: 'Engineer', symbol: '+', cost: 185, color: '#79f2ba',
      description: 'Global repair drone support.', range: 99, damage: 0, fireRate: 3.8, hp: 155, repair: 34
    }
  };

  const ENEMIES = {
    infantry: {
      name: 'Infantry', short: 'INF', hp: 88, speed: 0.72, reward: 13,
      damage: 7, attackRate: 0.85, attackRange: 1.12, baseDamage: 9, color: '#ffcb73'
    },
    tank: {
      name: 'Light Tank', short: 'TNK', hp: 330, speed: 0.34, reward: 38,
      damage: 20, attackRate: 1.5, attackRange: 1.45, baseDamage: 20, color: '#8fb37a', aoe: 1.25
    },
    fpv: {
      name: 'FPV Squad', short: 'FPV', hp: 100, speed: 0.64, reward: 21,
      damage: 6, attackRate: 2.3, attackRange: 1.42, baseDamage: 11, color: '#ff7f9f', stun: 2.25
    },
    truck: {
      name: 'Resource Truck', short: 'TRK', hp: 245, speed: 0.48, reward: 30,
      damage: 5, attackRate: 1.35, attackRange: 0.95, baseDamage: 42, color: '#ed9f5b', ignoresTowers: true
    },
    drone: {
      name: 'Attack Drone', short: 'AIR', hp: 115, speed: 0.93, reward: 24,
      damage: 10, attackRate: 1.0, attackRange: 1.3, baseDamage: 14, color: '#83b9ff', flying: true
    }
  };

  const LEVELS = [
    {
      id: 0,
      name: 'Dust Canyon',
      subtitle: 'Hold the desert extraction route.',
      tags: ['DESERT', 'OPEN PATH'],
      cardArt: 'radial-gradient(circle at 78% 24%, rgba(255,211,116,.82) 0 4%, transparent 5%), linear-gradient(155deg, transparent 36%, rgba(169,91,51,.9) 37% 48%, transparent 49%), linear-gradient(18deg, #d47a48, #4f2d32)',
      colors: { sky: '#1b2637', groundA: '#9c633e', groundB: '#865136', edge: '#5f372b', pathA: '#d3a267', pathB: '#be8855', grid: 'rgba(255,235,199,.08)', accent: '#ffd36d' },
      path: [[0,2],[1,2],[2,2],[3,2],[3,3],[3,4],[4,4],[5,4],[6,4],[7,4],[7,5],[7,6],[8,6],[9,6],[10,6],[10,7],[10,8],[11,8],[12,8],[13,8]],
      blocked: [[1,0],[2,0],[6,1],[7,1],[9,2],[11,3],[1,7],[4,8],[5,8],[8,9]],
      ores: [[2,6],[5,1],[9,8],[12,4]],
      decor: 'rock'
    },
    {
      id: 1,
      name: 'Frost Relay',
      subtitle: 'Defend the frozen communications hub.',
      tags: ['ICEFIELD', 'TIGHT TURNS'],
      cardArt: 'radial-gradient(circle at 22% 18%, rgba(219,247,255,.85) 0 3%, transparent 4%), linear-gradient(145deg, transparent 32%, rgba(120,195,220,.84) 33% 48%, transparent 49%), linear-gradient(35deg, #d9f6ff, #33566f 70%)',
      colors: { sky: '#142131', groundA: '#b9d9df', groundB: '#a4c9d2', edge: '#6f9baa', pathA: '#6f92a7', pathB: '#5a7d92', grid: 'rgba(255,255,255,.16)', accent: '#8ee8ff' },
      path: [[0,7],[1,7],[2,7],[2,6],[2,5],[3,5],[4,5],[4,4],[4,3],[5,3],[6,3],[7,3],[8,3],[8,4],[8,5],[9,5],[10,5],[11,5],[11,4],[11,3],[12,3],[13,3]],
      blocked: [[0,1],[1,1],[3,0],[5,7],[6,7],[7,8],[9,0],[10,1],[12,7],[13,7],[3,8]],
      ores: [[1,4],[6,1],[9,7],[12,1]],
      decor: 'ice'
    },
    {
      id: 2,
      name: 'Neon Wetlands',
      subtitle: 'Secure the flooded reactor district.',
      tags: ['SWAMP', 'AIR THREAT'],
      cardArt: 'radial-gradient(circle at 74% 20%, rgba(133,255,210,.65) 0 4%, transparent 5%), linear-gradient(160deg, transparent 27%, rgba(49,178,141,.8) 28% 44%, transparent 45%), linear-gradient(25deg, #112f3a, #3f2f65)',
      colors: { sky: '#10192a', groundA: '#3d756e', groundB: '#32655f', edge: '#244846', pathA: '#6c7184', pathB: '#5a5f73', grid: 'rgba(138,255,218,.1)', accent: '#6effca' },
      path: [[0,1],[1,1],[2,1],[2,2],[2,3],[3,3],[4,3],[5,3],[5,4],[5,5],[6,5],[7,5],[8,5],[8,6],[8,7],[9,7],[10,7],[11,7],[11,6],[11,5],[12,5],[13,5]],
      blocked: [[0,5],[1,5],[3,7],[4,7],[6,0],[7,0],[9,2],[10,2],[12,8],[13,8],[7,8]],
      ores: [[1,8],[4,1],[7,3],[10,9],[12,2]],
      decor: 'swamp'
    }
  ];

  let currentLevel = LEVELS[0];
  let state = null;
  let raf = 0;
  let lastTime = performance.now();
  let audioCtx = null;
  let soundOn = true;
  let selectedBuildType = null;
  let draggingFromCard = false;
  let hoverTile = null;
  let pointerCanvas = { x: 0, y: 0, inside: false };
  let idCounter = 1;
  let announceTimer = 0;

  function newState(level) {
    return {
      running: true,
      paused: false,
      speed: 1,
      level,
      ore: 310,
      baseHp: 100,
      maxBaseHp: 100,
      wave: 0,
      inWave: false,
      waveTotal: 0,
      waveResolved: 0,
      spawnQueue: [],
      spawnTimer: 0,
      towers: [],
      enemies: [],
      projectiles: [],
      effects: [],
      repairDrones: [],
      selectedTowerId: null,
      kills: 0,
      oreMined: 0,
      gameOver: false,
      uiTimer: 0,
      elapsed: 0
    };
  }

  function init() {
    buildLevelCards();
    buildTowerCards();
    bindUI();
    showHome();
    requestAnimationFrame(loop);
  }

  function buildLevelCards() {
    els.levelCards.innerHTML = '';
    LEVELS.forEach((level, index) => {
      const best = Number(localStorage.getItem(`ironline_best_${level.id}`) || 0);
      const card = document.createElement('article');
      card.className = 'level-card';
      card.style.setProperty('--card-art', level.cardArt);
      card.innerHTML = `
        <div class="level-index">OPERATION 0${index + 1}${best ? ` · BEST BASE ${best}%` : ''}</div>
        <h3>${level.name}</h3>
        <p>${level.subtitle}</p>
        <div class="level-tags">${level.tags.map(t => `<span>${t}</span>`).join('')}</div>`;
      card.addEventListener('click', () => startLevel(index));
      els.levelCards.appendChild(card);
    });
  }

  function buildTowerCards() {
    els.towerList.innerHTML = '';
    Object.entries(TOWERS).forEach(([key, tower]) => {
      const card = document.createElement('div');
      card.className = 'tower-card';
      card.dataset.type = key;
      card.style.setProperty('--tower-color', tower.color);
      card.innerHTML = `
        <div class="cost">◆ ${tower.cost}</div>
        <div class="tower-top"><div class="tower-symbol">${tower.symbol}</div><strong>${tower.name}</strong></div>
        <p>${tower.description}</p>`;
      card.addEventListener('pointerdown', e => {
        if (!state || state.gameOver) return;
        e.preventDefault();
        selectedBuildType = key;
        draggingFromCard = true;
        updateBuildSelection();
        els.buildModeBadge.textContent = 'PLACE';
        els.buildModeBadge.style.color = '#ffd97d';
      });
      card.addEventListener('mouseenter', e => showTowerTip(key, e));
      card.addEventListener('mouseleave', hideTip);
      els.towerList.appendChild(card);
    });
  }

  function bindUI() {
    els.homeBtn.addEventListener('click', showHome);
    els.resultHomeBtn.addEventListener('click', () => { hideResult(); showHome(); });
    els.retryBtn.addEventListener('click', () => { hideResult(); startLevel(currentLevel.id); });
    els.waveBtn.addEventListener('click', startNextWave);
    els.pauseBtn.addEventListener('click', () => {
      if (!state || state.gameOver) return;
      state.paused = !state.paused;
      els.pauseBtn.textContent = state.paused ? 'Resume' : 'Pause';
      announce(state.paused ? 'TACTICAL PAUSE' : 'BATTLE RESUMED', 0.8);
    });
    els.speedBtn.addEventListener('click', () => {
      if (!state) return;
      state.speed = state.speed === 1 ? 2 : state.speed === 2 ? 3 : 1;
      els.speedBtn.textContent = `${state.speed}×`;
    });
    els.soundBtn.addEventListener('click', () => {
      soundOn = !soundOn;
      els.soundBtn.textContent = `Sound: ${soundOn ? 'On' : 'Off'}`;
      if (soundOn) beep(360, 0.05, 0.025);
    });

    canvas.addEventListener('pointermove', onCanvasPointerMove);
    canvas.addEventListener('pointerleave', () => { pointerCanvas.inside = false; hoverTile = null; });
    canvas.addEventListener('pointerdown', onCanvasPointerDown);
    canvas.addEventListener('contextmenu', e => {
      e.preventDefault();
      cancelBuild();
      if (state) { state.selectedTowerId = null; renderInspector(); }
    });
    window.addEventListener('pointerup', onGlobalPointerUp);
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') cancelBuild();
      if (e.key === ' ' && state && !state.gameOver) {
        e.preventDefault();
        state.paused = !state.paused;
        els.pauseBtn.textContent = state.paused ? 'Resume' : 'Pause';
      }
      if (e.key.toLowerCase() === 'f') startNextWave();
    });
  }

  function startLevel(index) {
    currentLevel = LEVELS[index];
    state = newState(currentLevel);
    selectedBuildType = null;
    draggingFromCard = false;
    hoverTile = null;
    els.homeScreen.classList.remove('active');
    els.gameScreen.classList.add('active');
    els.missionName.textContent = currentLevel.name;
    els.resultModal.classList.add('hidden');
    els.pauseBtn.textContent = 'Pause';
    els.speedBtn.textContent = '1×';
    updateBuildSelection();
    updateUI(true);
    renderInspector();
    announce('DEPLOY DEFENSES', 1.5);
    beep(440, 0.08, 0.03);
  }

  function showHome() {
    if (state) state.running = false;
    state = null;
    selectedBuildType = null;
    els.gameScreen.classList.remove('active');
    els.homeScreen.classList.add('active');
    els.resultModal.classList.add('hidden');
    buildLevelCards();
  }

  function hideResult() {
    els.resultModal.classList.add('hidden');
  }

  function cancelBuild() {
    selectedBuildType = null;
    draggingFromCard = false;
    updateBuildSelection();
    els.buildModeBadge.textContent = 'READY';
    els.buildModeBadge.style.color = '#88ffd0';
  }

  function updateBuildSelection() {
    document.querySelectorAll('.tower-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.type === selectedBuildType);
    });
  }

  function onCanvasPointerMove(e) {
    const p = eventToCanvas(e);
    pointerCanvas = { x: p.x, y: p.y, inside: true };
    const grid = screenToGrid(p.x, p.y);
    const gx = Math.round(grid.x);
    const gy = Math.round(grid.y);
    hoverTile = (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) ? { x: gx, y: gy } : null;
  }

  function onCanvasPointerDown(e) {
    if (!state || state.gameOver || e.button !== 0) return;
    initAudio();
    const p = eventToCanvas(e);
    const grid = screenToGrid(p.x, p.y);
    const gx = Math.round(grid.x);
    const gy = Math.round(grid.y);

    if (selectedBuildType) {
      tryPlaceTower(selectedBuildType, gx, gy);
      return;
    }

    const tower = findTowerAt(gx, gy);
    state.selectedTowerId = tower ? tower.id : null;
    renderInspector();
  }

  function onGlobalPointerUp() {
    if (!draggingFromCard) return;
    draggingFromCard = false;
    if (pointerCanvas.inside && hoverTile && selectedBuildType) {
      tryPlaceTower(selectedBuildType, hoverTile.x, hoverTile.y);
    }
  }

  function eventToCanvas(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function gridToScreen(gx, gy) {
    return {
      x: ORIGIN.x + (gx - gy) * (TILE_W / 2),
      y: ORIGIN.y + (gx + gy) * (TILE_H / 2)
    };
  }

  function screenToGrid(sx, sy) {
    const dx = sx - ORIGIN.x;
    const dy = sy - ORIGIN.y;
    return {
      x: (dy / (TILE_H / 2) + dx / (TILE_W / 2)) / 2,
      y: (dy / (TILE_H / 2) - dx / (TILE_W / 2)) / 2
    };
  }

  function tileKey(x, y) { return `${x},${y}`; }

  function isPathTile(x, y) {
    return currentLevel.path.some(p => p[0] === x && p[1] === y);
  }

  function isBlockedTile(x, y) {
    return currentLevel.blocked.some(p => p[0] === x && p[1] === y);
  }

  function findTowerAt(x, y) {
    return state ? state.towers.find(t => t.gx === x && t.gy === y && !t.dead) : null;
  }

  function isValidPlacement(x, y) {
    if (!state || x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) return false;
    return !isPathTile(x, y) && !isBlockedTile(x, y) && !findTowerAt(x, y);
  }

  function tryPlaceTower(type, gx, gy) {
    if (!state || state.paused || state.gameOver) return false;
    const def = TOWERS[type];
    if (!def || !isValidPlacement(gx, gy)) {
      announce('INVALID DEPLOYMENT TILE', 0.65);
      beep(120, 0.06, 0.02);
      return false;
    }
    if (state.ore < def.cost) {
      announce('NOT ENOUGH ORE', 0.75);
      beep(130, 0.08, 0.025);
      return false;
    }
    state.ore -= def.cost;
    const tower = {
      id: idCounter++, type, gx, gy, level: 1, upgrades: 0,
      hp: def.hp, maxHp: def.hp, cooldown: Math.random() * 0.25,
      incomeTimer: def.fireRate, stunTimer: 0, flash: 0, angle: 0, dead: false,
      totalRepair: 0
    };
    state.towers.push(tower);
    state.selectedTowerId = tower.id;
    addEffect('build', gx, gy, def.color, 0.55);
    beep(type === 'mine' ? 520 : 300, 0.06, 0.02);
    renderInspector();
    updateUI(true);
    return true;
  }

  function towerStats(tower) {
    const def = TOWERS[tower.type];
    const u = tower.upgrades;
    return {
      range: def.range ? def.range * (1 + u * 0.07) : 0,
      damage: def.damage ? def.damage * (1 + u * 0.42) : 0,
      fireRate: def.fireRate * Math.pow(0.9, u),
      aoe: def.aoe ? def.aoe * (1 + u * 0.08) : 0,
      income: def.income ? Math.round(def.income * (1 + u * 0.5)) : 0,
      repair: def.repair ? Math.round(def.repair * (1 + u * 0.42)) : 0,
      slow: def.slow ? Math.min(0.75, def.slow + u * 0.07) : 0
    };
  }

  function upgradeCost(tower) {
    return Math.round(TOWERS[tower.type].cost * (0.72 + tower.upgrades * 0.38));
  }

  function upgradeTower(id) {
    const tower = state && state.towers.find(t => t.id === id);
    if (!tower || tower.upgrades >= 3) return;
    const cost = upgradeCost(tower);
    if (state.ore < cost) {
      announce('NOT ENOUGH ORE', 0.7);
      beep(130, 0.08, 0.025);
      return;
    }
    state.ore -= cost;
    tower.upgrades++;
    tower.level++;
    const oldMax = tower.maxHp;
    tower.maxHp = Math.round(TOWERS[tower.type].hp * (1 + tower.upgrades * 0.28));
    tower.hp = Math.min(tower.maxHp, tower.hp + (tower.maxHp - oldMax) + 25);
    addEffect('upgrade', tower.gx, tower.gy, TOWERS[tower.type].color, 0.8);
    announce(`${TOWERS[tower.type].name.toUpperCase()} UPGRADED`, 0.7);
    beep(680, 0.08, 0.028);
    renderInspector();
    updateUI(true);
  }

  function sellTower(id) {
    if (!state) return;
    const i = state.towers.findIndex(t => t.id === id);
    if (i < 0) return;
    const tower = state.towers[i];
    const invested = TOWERS[tower.type].cost + Array.from({length: tower.upgrades}, (_, u) => Math.round(TOWERS[tower.type].cost * (0.72 + u * 0.38))).reduce((a,b)=>a+b,0);
    const refund = Math.round(invested * 0.62);
    state.ore += refund;
    addEffect('sell', tower.gx, tower.gy, '#ffd26b', 0.45);
    state.towers.splice(i, 1);
    state.selectedTowerId = null;
    announce(`SALVAGED +${refund} ORE`, 0.7);
    renderInspector();
    updateUI(true);
  }

  function startNextWave() {
    if (!state || state.paused || state.gameOver || state.inWave || state.wave >= 10) return;
    state.wave++;
    const composition = getWaveComposition(state.level.id, state.wave);
    state.spawnQueue = composition.flatMap(item => Array.from({ length: item.count }, () => item.type));
    state.waveTotal = state.spawnQueue.length;
    state.waveResolved = 0;
    state.spawnTimer = 0.25;
    state.inWave = true;
    els.waveBtn.disabled = true;
    announce(`WAVE ${state.wave} INBOUND`, 1.1);
    beep(220 + state.wave * 15, 0.12, 0.03);
    updateUI(true);
  }

  function getWaveComposition(levelId, wave) {
    const base = [];
    const infantry = 5 + wave * 2 + levelId;
    base.push({ type: 'infantry', count: infantry });
    if (wave >= 2) base.push({ type: 'drone', count: Math.floor((wave + levelId) / 2) });
    if (wave >= 3) base.push({ type: 'fpv', count: Math.floor(wave / 2) });
    if (wave >= 4) base.push({ type: 'tank', count: Math.floor((wave - 1) / 2) });
    if (wave >= 5) base.push({ type: 'truck', count: Math.max(1, Math.floor((wave - 3) / 2)) });
    if (levelId === 1 && wave >= 6) base.push({ type: 'tank', count: 1 + Math.floor(wave / 5) });
    if (levelId === 2 && wave >= 3) base.push({ type: 'drone', count: 1 + Math.floor(wave / 3) });
    if (wave === 10) {
      base.push({ type: 'tank', count: 3 + levelId });
      base.push({ type: 'truck', count: 2 });
      base.push({ type: 'drone', count: 4 + levelId * 2 });
    }
    return base.filter(x => x.count > 0);
  }

  function createEnemy(type) {
    const def = ENEMIES[type];
    const scale = 1 + (state.wave - 1) * 0.105 + state.level.id * 0.08;
    const path = def.flying ? [state.level.path[0], state.level.path[state.level.path.length - 1]] : state.level.path;
    const start = path[0];
    return {
      id: idCounter++, type, x: start[0], y: start[1], path, pathIndex: 0,
      hp: def.hp * scale, maxHp: def.hp * scale, speed: def.speed * (1 + state.wave * 0.012),
      attackTimer: Math.random() * 0.4, slowTimer: 0, slowAmount: 0,
      flash: 0, dead: false, reachedBase: false, rotation: 0, progress: 0,
      bob: Math.random() * Math.PI * 2
    };
  }

  function update(dt) {
    if (!state || !state.running || state.gameOver || state.paused) return;
    const step = dt * state.speed;
    state.elapsed += step;
    state.uiTimer -= step;
    if (announceTimer > 0) {
      announceTimer -= dt;
      if (announceTimer <= 0) els.announcement.classList.add('hidden');
    }

    updateSpawning(step);
    updateTowers(step);
    updateEnemies(step);
    updateProjectiles(step);
    updateEffects(step);
    updateRepairDrones(step);
    cleanupEntities();
    checkWaveEnd();

    if (state.uiTimer <= 0) {
      state.uiTimer = 0.12;
      updateUI(false);
      if (state.selectedTowerId) renderInspector();
    }
  }

  function updateSpawning(dt) {
    if (!state.inWave || !state.spawnQueue.length) return;
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      const type = state.spawnQueue.shift();
      state.enemies.push(createEnemy(type));
      state.spawnTimer = type === 'tank' ? 0.9 : type === 'truck' ? 1.0 : 0.52;
    }
  }

  function updateTowers(dt) {
    for (const tower of state.towers) {
      if (tower.dead) continue;
      tower.flash = Math.max(0, tower.flash - dt * 5);
      tower.stunTimer = Math.max(0, tower.stunTimer - dt);
      tower.cooldown -= dt;
      const def = TOWERS[tower.type];
      const stats = towerStats(tower);

      if (tower.type === 'mine') {
        tower.incomeTimer -= dt;
        if (tower.incomeTimer <= 0) {
          const bonus = currentLevel.ores.some(o => o[0] === tower.gx && o[1] === tower.gy) ? 1.35 : 1;
          const income = Math.round(stats.income * bonus);
          state.ore += income;
          state.oreMined += income;
          tower.incomeTimer = stats.fireRate;
          addFloatingText(tower.gx, tower.gy, `+${income}`, '#ffd26b');
          addEffect('mine', tower.gx, tower.gy, '#ffd26b', 0.55);
          beep(720, 0.03, 0.012);
        }
        continue;
      }

      if (tower.type === 'engineer') {
        if (tower.stunTimer > 0) continue;
        if (tower.cooldown <= 0) {
          const target = state.towers
            .filter(t => !t.dead && t.id !== tower.id && t.hp < t.maxHp)
            .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
          if (target) {
            state.repairDrones.push({
              x: tower.gx, y: tower.gy, targetId: target.id, sourceId: tower.id,
              progress: 0, duration: 0.9, repair: stats.repair, color: def.color
            });
            tower.cooldown = stats.fireRate;
            beep(510, 0.05, 0.015);
          } else {
            tower.cooldown = 0.35;
          }
        }
        continue;
      }

      if (tower.stunTimer > 0 || tower.cooldown > 0) continue;
      const target = selectTarget(tower, stats.range);
      if (!target) continue;
      const dx = target.x - tower.gx;
      const dy = target.y - tower.gy;
      tower.angle = Math.atan2(dy, dx);
      fireTower(tower, target, stats);
      tower.cooldown = stats.fireRate;
      tower.flash = 1;
    }
  }

  function selectTarget(tower, range) {
    let best = null;
    let bestScore = -Infinity;
    for (const enemy of state.enemies) {
      if (enemy.dead || enemy.reachedBase) continue;
      const d = distance(tower.gx, tower.gy, enemy.x, enemy.y);
      if (d > range) continue;
      const score = enemy.progress * 100 - d + (enemy.type === 'truck' ? 8 : 0);
      if (score > bestScore) { best = enemy; bestScore = score; }
    }
    return best;
  }

  function fireTower(tower, target, stats) {
    const type = tower.type;
    if (type === 'gatling') {
      damageEnemy(target, stats.damage, tower);
      state.projectiles.push({ kind: 'tracer', x: tower.gx, y: tower.gy, tx: target.x, ty: target.y, life: 0.1, maxLife: 0.1, color: '#a8f1ff' });
      if (Math.random() < 0.45) beep(160, 0.022, 0.008);
    } else if (type === 'laser') {
      damageEnemy(target, stats.damage, tower);
      target.slowAmount = stats.slow;
      target.slowTimer = 0.42;
      state.projectiles.push({ kind: 'laser', x: tower.gx, y: tower.gy, targetId: target.id, life: 0.12, maxLife: 0.12, color: '#e4a5ff' });
      if (Math.random() < 0.35) beep(880, 0.025, 0.006);
    } else if (type === 'rocket') {
      state.projectiles.push({
        kind: 'rocket', x: tower.gx, y: tower.gy, targetId: target.id,
        tx: target.x, ty: target.y, speed: 5.2, damage: stats.damage, aoe: stats.aoe,
        color: '#ffb17d', sourceId: tower.id, trail: []
      });
      beep(210, 0.055, 0.012);
    }
  }

  function updateEnemies(dt) {
    for (const enemy of state.enemies) {
      if (enemy.dead || enemy.reachedBase) continue;
      const def = ENEMIES[enemy.type];
      enemy.flash = Math.max(0, enemy.flash - dt * 5);
      enemy.attackTimer -= dt;
      enemy.slowTimer = Math.max(0, enemy.slowTimer - dt);
      const slowMul = enemy.slowTimer > 0 ? 1 - enemy.slowAmount : 1;

      let targetTower = null;
      if (!def.ignoresTowers) {
        targetTower = state.towers
          .filter(t => !t.dead && distance(enemy.x, enemy.y, t.gx, t.gy) <= def.attackRange)
          .sort((a, b) => distance(enemy.x, enemy.y, a.gx, a.gy) - distance(enemy.x, enemy.y, b.gx, b.gy))[0] || null;
      }

      if (targetTower) {
        enemy.rotation = Math.atan2(targetTower.gy - enemy.y, targetTower.gx - enemy.x);
        if (enemy.attackTimer <= 0) {
          enemyAttackTower(enemy, targetTower);
          enemy.attackTimer = def.attackRate;
        }
        continue;
      }

      const nextIndex = enemy.pathIndex + 1;
      if (nextIndex >= enemy.path.length) {
        reachBase(enemy);
        continue;
      }
      const target = enemy.path[nextIndex];
      const dx = target[0] - enemy.x;
      const dy = target[1] - enemy.y;
      const d = Math.hypot(dx, dy);
      const move = enemy.speed * slowMul * dt;
      enemy.rotation = Math.atan2(dy, dx);
      if (d <= move) {
        enemy.x = target[0]; enemy.y = target[1]; enemy.pathIndex++;
      } else {
        enemy.x += (dx / d) * move;
        enemy.y += (dy / d) * move;
      }
      const segmentProgress = d > 0 ? 1 - Math.min(1, d / distance(enemy.path[enemy.pathIndex][0], enemy.path[enemy.pathIndex][1], target[0], target[1])) : 1;
      enemy.progress = (enemy.pathIndex + segmentProgress) / Math.max(1, enemy.path.length - 1);
    }
  }

  function enemyAttackTower(enemy, target) {
    const def = ENEMIES[enemy.type];
    if (enemy.type === 'tank') {
      state.towers.forEach(t => {
        if (!t.dead && distance(t.gx, t.gy, target.gx, target.gy) <= def.aoe) {
          damageTower(t, def.damage * (t.id === target.id ? 1 : 0.55));
        }
      });
      addEffect('explosion', target.gx, target.gy, '#ff9b68', 0.55);
      beep(95, 0.09, 0.02);
    } else {
      damageTower(target, def.damage);
      state.projectiles.push({ kind: enemy.type === 'drone' ? 'enemyLaser' : 'enemyShot', x: enemy.x, y: enemy.y, tx: target.gx, ty: target.gy, life: 0.14, maxLife: 0.14, color: def.color });
      if (enemy.type === 'fpv') {
        target.stunTimer = Math.max(target.stunTimer, def.stun);
        addEffect('stun', target.gx, target.gy, '#ff74c6', def.stun);
      }
      beep(enemy.type === 'fpv' ? 330 : 125, 0.035, 0.008);
    }
  }

  function damageTower(tower, amount) {
    if (tower.dead) return;
    tower.hp -= amount;
    tower.flash = 1;
    if (tower.hp <= 0) {
      tower.hp = 0;
      tower.dead = true;
      addEffect('explosion', tower.gx, tower.gy, TOWERS[tower.type].color, 0.9);
      announce(`${TOWERS[tower.type].name.toUpperCase()} DESTROYED`, 0.75);
      if (state.selectedTowerId === tower.id) state.selectedTowerId = null;
      beep(75, 0.16, 0.035);
    }
  }

  function damageEnemy(enemy, amount) {
    if (enemy.dead) return;
    enemy.hp -= amount;
    enemy.flash = 1;
    if (enemy.hp <= 0) {
      enemy.hp = 0;
      enemy.dead = true;
      const reward = Math.round(ENEMIES[enemy.type].reward * (1 + state.level.id * 0.05));
      state.ore += reward;
      state.kills++;
      state.waveResolved++;
      addFloatingText(enemy.x, enemy.y, `+${reward}`, '#ffd26b');
      addEffect('enemyDown', enemy.x, enemy.y, ENEMIES[enemy.type].color, 0.42);
      beep(260, 0.025, 0.008);
    }
  }

  function reachBase(enemy) {
    if (enemy.reachedBase) return;
    enemy.reachedBase = true;
    state.waveResolved++;
    const amount = ENEMIES[enemy.type].baseDamage;
    state.baseHp = Math.max(0, state.baseHp - amount);
    addEffect('baseHit', currentLevel.path[currentLevel.path.length - 1][0], currentLevel.path[currentLevel.path.length - 1][1], '#ff6868', 0.8);
    addFloatingText(currentLevel.path[currentLevel.path.length - 1][0], currentLevel.path[currentLevel.path.length - 1][1], `-${amount}`, '#ff7f7f');
    beep(70, 0.18, 0.04);
    if (state.baseHp <= 0) endGame(false);
  }

  function updateProjectiles(dt) {
    for (const p of state.projectiles) {
      if (p.kind === 'rocket') {
        const target = state.enemies.find(e => e.id === p.targetId && !e.dead && !e.reachedBase);
        if (target) { p.tx = target.x; p.ty = target.y; }
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        const d = Math.hypot(dx, dy);
        const move = p.speed * dt;
        p.trail.push({ x: p.x, y: p.y, life: 0.3 });
        p.trail.forEach(t => t.life -= dt);
        p.trail = p.trail.filter(t => t.life > 0);
        if (d <= move || d < 0.08) {
          p.dead = true;
          for (const enemy of state.enemies) {
            if (!enemy.dead && !enemy.reachedBase && distance(enemy.x, enemy.y, p.tx, p.ty) <= p.aoe) {
              damageEnemy(enemy, p.damage * (enemy.id === p.targetId ? 1 : 0.72));
            }
          }
          addEffect('explosion', p.tx, p.ty, '#ff9f64', 0.6);
          beep(105, 0.08, 0.02);
        } else {
          p.x += dx / d * move;
          p.y += dy / d * move;
        }
      } else {
        p.life -= dt;
        if (p.life <= 0) p.dead = true;
      }
    }
  }

  function updateRepairDrones(dt) {
    for (const d of state.repairDrones) {
      d.progress += dt / d.duration;
      const target = state.towers.find(t => t.id === d.targetId && !t.dead);
      const source = state.towers.find(t => t.id === d.sourceId && !t.dead);
      if (!target || !source) { d.dead = true; continue; }
      d.x = lerp(source.gx, target.gx, easeInOut(Math.min(1, d.progress)));
      d.y = lerp(source.gy, target.gy, easeInOut(Math.min(1, d.progress)));
      if (d.progress >= 1) {
        const healed = Math.min(d.repair, target.maxHp - target.hp);
        target.hp += healed;
        source.totalRepair += healed;
        addFloatingText(target.gx, target.gy, `+${Math.round(healed)}`, '#79f2ba');
        addEffect('repair', target.gx, target.gy, '#79f2ba', 0.65);
        d.dead = true;
        beep(640, 0.05, 0.015);
      }
    }
  }

  function updateEffects(dt) {
    for (const e of state.effects) {
      e.life -= dt;
      e.t += dt;
      if (e.kind === 'float') e.yOffset -= dt * 22;
      if (e.life <= 0) e.dead = true;
    }
  }

  function cleanupEntities() {
    state.towers = state.towers.filter(t => !t.dead);
    state.enemies = state.enemies.filter(e => !e.dead && !e.reachedBase);
    state.projectiles = state.projectiles.filter(p => !p.dead);
    state.effects = state.effects.filter(e => !e.dead);
    state.repairDrones = state.repairDrones.filter(d => !d.dead);
  }

  function checkWaveEnd() {
    if (!state.inWave) return;
    if (state.spawnQueue.length === 0 && state.enemies.length === 0) {
      state.inWave = false;
      const bonus = 35 + state.wave * 8;
      state.ore += bonus;
      announce(`WAVE ${state.wave} CLEARED · +${bonus} ORE`, 1.1);
      beep(600, 0.09, 0.025);
      if (state.wave >= 10) endGame(true);
      else updateUI(true);
    }
  }

  function endGame(victory) {
    if (!state || state.gameOver) return;
    state.gameOver = true;
    state.paused = true;
    els.resultModal.classList.remove('hidden');
    els.resultBadge.textContent = victory ? 'OPERATION COMPLETE' : 'DEFENSE FAILED';
    els.resultBadge.style.color = victory ? '#79f2ba' : '#ff7b7b';
    els.resultTitle.textContent = victory ? 'Base secured' : 'Command base lost';
    els.resultText.textContent = victory
      ? 'The final hostile wave has been neutralized. The sector is under your control.'
      : 'Hostile forces breached the perimeter. Rebuild your economy and adjust tower placement.';
    els.resultWaves.textContent = String(state.wave);
    els.resultKills.textContent = String(state.kills);
    els.resultOre.textContent = String(state.oreMined);
    if (victory) {
      const best = Number(localStorage.getItem(`ironline_best_${state.level.id}`) || 0);
      if (state.baseHp > best) localStorage.setItem(`ironline_best_${state.level.id}`, String(Math.round(state.baseHp)));
      beep(720, 0.18, 0.035);
    } else beep(70, 0.32, 0.04);
  }

  function addEffect(kind, x, y, color, duration) {
    if (!state) return;
    state.effects.push({ kind, x, y, color, life: duration, maxLife: duration, t: 0, dead: false, yOffset: 0 });
  }

  function addFloatingText(x, y, text, color) {
    if (!state) return;
    state.effects.push({ kind: 'float', x, y, text, color, life: 0.85, maxLife: 0.85, t: 0, dead: false, yOffset: -15 });
  }

  function updateUI(force) {
    if (!state) return;
    els.oreValue.textContent = Math.floor(state.ore).toString();
    els.waveValue.textContent = state.wave.toString();
    els.baseValue.textContent = `${Math.ceil(state.baseHp)}%`;
    els.baseValue.style.color = state.baseHp <= 30 ? '#ff7b7b' : '';

    document.querySelectorAll('.tower-card').forEach(card => {
      const cost = TOWERS[card.dataset.type].cost;
      card.classList.toggle('unaffordable', state.ore < cost);
    });

    if (state.inWave) {
      els.waveStateLabel.textContent = 'ACTIVE WAVE';
      els.nextWaveText.textContent = `${state.enemies.length + state.spawnQueue.length} hostiles remaining`;
      els.waveBtn.textContent = 'Wave Active';
      els.waveBtn.disabled = true;
      const progress = state.waveTotal ? state.waveResolved / state.waveTotal : 0;
      els.waveProgress.style.width = `${Math.min(100, progress * 100)}%`;
    } else if (state.wave >= 10) {
      els.waveStateLabel.textContent = 'COMPLETE';
      els.nextWaveText.textContent = 'Sector secured';
      els.waveBtn.textContent = 'Complete';
      els.waveBtn.disabled = true;
      els.waveProgress.style.width = '100%';
    } else {
      els.waveStateLabel.textContent = 'PREP PHASE';
      els.nextWaveText.textContent = `Wave ${state.wave + 1} ready`;
      els.waveBtn.textContent = 'Start Wave';
      els.waveBtn.disabled = false;
      els.waveProgress.style.width = '0%';
    }

    const forecast = state.wave < 10 ? getWaveComposition(state.level.id, state.wave + 1) : [];
    els.enemyForecast.innerHTML = forecast.map(i => `<span class="enemy-chip">${ENEMIES[i.type].short} ×${i.count}</span>`).join('');
  }

  function renderInspector() {
    if (!state) return;
    const tower = state.towers.find(t => t.id === state.selectedTowerId);
    if (!tower) {
      els.inspector.classList.add('empty');
      els.inspector.innerHTML = `<div class="empty-inspector"><div class="radar-icon">◎</div><strong>No tower selected</strong><span>Select a deployed tower to view stats and upgrades.</span></div>`;
      return;
    }
    els.inspector.classList.remove('empty');
    const def = TOWERS[tower.type];
    const stats = towerStats(tower);
    const hpPct = Math.max(0, tower.hp / tower.maxHp * 100);
    const upgradeCostValue = tower.upgrades < 3 ? upgradeCost(tower) : 0;
    let statA = stats.damage ? `${Math.round(stats.damage * 10) / 10}` : tower.type === 'mine' ? `+${stats.income}` : `+${stats.repair}`;
    let statALabel = stats.damage ? 'DAMAGE' : tower.type === 'mine' ? 'ORE/TICK' : 'REPAIR';
    let statB = stats.range ? `${stats.range.toFixed(1)}` : tower.type === 'mine' ? `${stats.fireRate.toFixed(1)}s` : 'GLOBAL';
    let statBLabel = stats.range ? 'RANGE' : tower.type === 'mine' ? 'INTERVAL' : 'RANGE';
    const status = tower.stunTimer > 0 ? `DISABLED ${tower.stunTimer.toFixed(1)}s` : 'ONLINE';
    els.inspector.innerHTML = `
      <div class="inspector-head">
        <div class="inspector-icon" style="--tower-color:${def.color}">${def.symbol}</div>
        <div><h3>${def.name} · Lv.${tower.level}</h3><span>${status}</span></div>
      </div>
      <div class="hp-row"><div class="hp-label"><span>STRUCTURE</span><span>${Math.ceil(tower.hp)} / ${tower.maxHp}</span></div><div class="hp-track"><div class="hp-fill" style="width:${hpPct}%"></div></div></div>
      <div class="stats-grid">
        <div class="stat-box"><small>${statALabel}</small><strong>${statA}</strong></div>
        <div class="stat-box"><small>${statBLabel}</small><strong>${statB}</strong></div>
        <div class="stat-box"><small>UPGRADES</small><strong>${tower.upgrades}/3</strong></div>
      </div>
      <div class="inspector-actions">
        <button id="upgradeTowerBtn" class="primary-btn" ${tower.upgrades >= 3 ? 'disabled' : ''}>${tower.upgrades >= 3 ? 'Max Level' : `Upgrade · ◆ ${upgradeCostValue}`}</button>
        <button id="sellTowerBtn" class="secondary-btn sell-btn">Sell</button>
      </div>`;
    const up = document.getElementById('upgradeTowerBtn');
    const sell = document.getElementById('sellTowerBtn');
    if (up) up.addEventListener('click', () => upgradeTower(tower.id));
    if (sell) sell.addEventListener('click', () => sellTower(tower.id));
  }

  function showTowerTip(type, e) {
    const t = TOWERS[type];
    els.hoverTip.innerHTML = `<strong>${t.name}</strong><br>${t.description}<br><span style="color:#ffd26b">Cost: ◆ ${t.cost}</span>`;
    els.hoverTip.style.left = `${Math.min(window.innerWidth - 245, e.clientX + 12)}px`;
    els.hoverTip.style.top = `${Math.max(10, e.clientY - 30)}px`;
    els.hoverTip.classList.remove('hidden');
  }

  function hideTip() { els.hoverTip.classList.add('hidden'); }

  function announce(text, duration = 1) {
    els.announcement.textContent = text;
    els.announcement.classList.remove('hidden');
    announceTimer = duration;
  }

  function loop(now) {
    const rawDt = Math.min(0.04, (now - lastTime) / 1000 || 0);
    lastTime = now;
    update(rawDt);
    render();
    raf = requestAnimationFrame(loop);
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!state) {
      ctx.fillStyle = '#0b1320';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }
    drawBackground();
    drawGrid();
    drawMapDecor();
    drawPathMarkers();

    const entities = [];
    state.towers.forEach(t => entities.push({ y: gridToScreen(t.gx, t.gy).y, kind: 'tower', data: t }));
    state.enemies.forEach(e => entities.push({ y: gridToScreen(e.x, e.y).y + (ENEMIES[e.type].flying ? -28 : 0), kind: 'enemy', data: e }));
    const end = currentLevel.path[currentLevel.path.length - 1];
    entities.push({ y: gridToScreen(end[0], end[1]).y + 5, kind: 'base', data: end });
    entities.sort((a, b) => a.y - b.y);
    entities.forEach(e => {
      if (e.kind === 'tower') drawTower(e.data);
      else if (e.kind === 'enemy') drawEnemy(e.data);
      else drawBase(e.data);
    });

    drawProjectiles();
    drawRepairDrones();
    drawEffects();
    drawPlacementGhost();
    drawRangeOverlay();
    drawVignette();
  }

  function drawBackground() {
    const c = currentLevel.colors;
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, c.sky);
    grad.addColorStop(0.7, '#0c1421');
    grad.addColorStop(1, '#080d16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.arc(960, 90, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawGrid() {
    const c = currentLevel.colors;
    const pathSet = new Set(currentLevel.path.map(p => tileKey(p[0], p[1])));
    for (let sum = 0; sum <= GRID_W + GRID_H - 2; sum++) {
      for (let gx = 0; gx < GRID_W; gx++) {
        const gy = sum - gx;
        if (gy < 0 || gy >= GRID_H) continue;
        const p = gridToScreen(gx, gy);
        const path = pathSet.has(tileKey(gx, gy));
        const fill = path ? (((gx + gy) & 1) ? c.pathA : c.pathB) : (((gx + gy) & 1) ? c.groundA : c.groundB);
        drawTile(p.x, p.y, fill, c.edge, c.grid, 9);
      }
    }
  }

  function drawTile(x, y, fill, edge, stroke, depth) {
    ctx.beginPath();
    ctx.moveTo(x - TILE_W / 2, y);
    ctx.lineTo(x, y + TILE_H / 2);
    ctx.lineTo(x + TILE_W / 2, y);
    ctx.lineTo(x, y - TILE_H / 2);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - TILE_W / 2, y);
    ctx.lineTo(x, y + TILE_H / 2);
    ctx.lineTo(x, y + TILE_H / 2 + depth);
    ctx.lineTo(x - TILE_W / 2, y + depth);
    ctx.closePath();
    ctx.fillStyle = shade(edge, -10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + TILE_W / 2, y);
    ctx.lineTo(x, y + TILE_H / 2);
    ctx.lineTo(x, y + TILE_H / 2 + depth);
    ctx.lineTo(x + TILE_W / 2, y + depth);
    ctx.closePath();
    ctx.fillStyle = edge;
    ctx.fill();
  }

  function drawMapDecor() {
    currentLevel.blocked.forEach((b, i) => {
      const p = gridToScreen(b[0], b[1]);
      if (currentLevel.decor === 'rock') drawRock(p.x, p.y - 5, i);
      else if (currentLevel.decor === 'ice') drawIce(p.x, p.y - 4, i);
      else drawSwamp(p.x, p.y, i);
    });
    currentLevel.ores.forEach((o, i) => {
      if (!findTowerAt(o[0], o[1])) {
        const p = gridToScreen(o[0], o[1]);
        drawOreCrystal(p.x, p.y - 2, i);
      }
    });
    const start = currentLevel.path[0];
    const p = gridToScreen(start[0], start[1]);
    drawSpawnGate(p.x, p.y);
  }

  function drawPathMarkers() {
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#ffffff';
    for (let i = 1; i < currentLevel.path.length - 1; i += 3) {
      const a = currentLevel.path[i];
      const b = currentLevel.path[Math.min(i + 1, currentLevel.path.length - 1)];
      const p = gridToScreen(a[0], a[1]);
      const angle = Math.atan2((b[0] + b[1]) - (a[0] + a[1]), (b[0] - b[1]) - (a[0] - a[1]));
      ctx.save();
      ctx.translate(p.x, p.y - 2);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(8, 0); ctx.lineTo(-6, -4); ctx.lineTo(-2, 0); ctx.lineTo(-6, 4); ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawSpawnGate(x, y) {
    ctx.save();
    ctx.translate(x, y - 5);
    ctx.fillStyle = '#283448';
    ctx.fillRect(-27, -28, 8, 31);
    ctx.fillRect(19, -28, 8, 31);
    ctx.fillStyle = currentLevel.colors.accent;
    ctx.fillRect(-23, -24, 46, 5);
    ctx.globalAlpha = 0.22 + Math.sin(state.elapsed * 4) * 0.08;
    ctx.fillStyle = currentLevel.colors.accent;
    ctx.fillRect(-18, -16, 36, 18);
    ctx.restore();
  }

  function drawBase(end) {
    const p = gridToScreen(end[0], end[1]);
    ctx.save();
    ctx.translate(p.x, p.y - 8);
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ellipse(0, 17, 34, 12); ctx.fill();
    ctx.fillStyle = '#26354e';
    isoBox(-27, -4, 54, 29, 24, '#334764', '#263750', '#1d2a3f');
    ctx.fillStyle = state.baseHp <= 30 ? '#ff6d6d' : currentLevel.colors.accent;
    ctx.fillRect(-13, -30, 26, 8);
    ctx.fillStyle = '#0d1725';
    ctx.fillRect(-8, -28, 16, 4);
    ctx.fillStyle = '#8fb4dc';
    ctx.fillRect(-20, -11, 10, 7);
    ctx.fillRect(10, -11, 10, 7);
    ctx.restore();
  }

  function drawTower(tower) {
    const def = TOWERS[tower.type];
    const p = gridToScreen(tower.gx, tower.gy);
    ctx.save();
    ctx.translate(p.x, p.y - 7);
    if (tower.flash > 0) ctx.globalAlpha = 0.65 + tower.flash * 0.35;

    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ellipse(0, 14, 22, 8); ctx.fill();
    isoBox(-18, 0, 36, 18, 13, shade(def.color, -34), shade(def.color, -47), shade(def.color, -55));

    if (tower.type === 'gatling') drawGatling(tower, def);
    else if (tower.type === 'rocket') drawRocketTower(tower, def);
    else if (tower.type === 'laser') drawLaserTower(tower, def);
    else if (tower.type === 'mine') drawMineTower(tower, def);
    else drawEngineerTower(tower, def);

    for (let i = 0; i < tower.upgrades; i++) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.8;
      ctx.fillRect(-10 + i * 8, 11, 5, 2);
    }
    ctx.globalAlpha = 1;
    if (tower.stunTimer > 0) {
      ctx.strokeStyle = '#ff7bd4';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const r = 19 + i * 4 + Math.sin(state.elapsed * 8 + i) * 2;
        ctx.beginPath(); ctx.arc(0, -8, r, Math.PI * 1.05, Math.PI * 1.9); ctx.stroke();
      }
    }
    if (tower.hp < tower.maxHp) drawHealthBar(0, -40, 38, tower.hp / tower.maxHp, '#79f2ba');
    ctx.restore();
  }

  function drawGatling(t, def) {
    ctx.save();
    ctx.translate(0, -18);
    ctx.rotate(t.angle * 0.55);
    ctx.fillStyle = def.color;
    ellipse(0, 0, 13, 8); ctx.fill();
    ctx.fillStyle = '#d8f8ff';
    ctx.fillRect(4, -5, 21, 3); ctx.fillRect(4, 2, 21, 3);
    ctx.restore();
  }

  function drawRocketTower(t, def) {
    ctx.save();
    ctx.translate(0, -18);
    ctx.rotate(t.angle * 0.55);
    ctx.fillStyle = def.color;
    roundRect(-14, -9, 28, 17, 5); ctx.fill();
    ctx.fillStyle = '#ffe3d2';
    ctx.fillRect(7, -6, 15, 5); ctx.fillRect(7, 2, 15, 5);
    ctx.restore();
  }

  function drawLaserTower(t, def) {
    ctx.save();
    ctx.translate(0, -19);
    ctx.fillStyle = '#2a2037';
    ctx.beginPath(); ctx.moveTo(-13, 6); ctx.lineTo(0, -15); ctx.lineTo(13, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = def.color;
    ctx.beginPath(); ctx.arc(0, -9, 7 + Math.sin(state.elapsed * 5) * 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawMineTower(t, def) {
    ctx.save();
    ctx.translate(0, -18);
    ctx.fillStyle = '#55452a';
    roundRect(-16, -11, 32, 22, 5); ctx.fill();
    ctx.fillStyle = def.color;
    ctx.beginPath(); ctx.moveTo(0,-15); ctx.lineTo(8,-4); ctx.lineTo(2,8); ctx.lineTo(-8,1); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.25 + Math.sin(state.elapsed * 4) * 0.08;
    ctx.beginPath(); ctx.arc(0, -4, 18, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawEngineerTower(t, def) {
    ctx.save();
    ctx.translate(0, -18);
    ctx.strokeStyle = def.color;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = def.color;
    ctx.fillRect(-3, -9, 6, 18); ctx.fillRect(-9, -3, 18, 6);
    ctx.globalAlpha = 0.45;
    ctx.beginPath(); ctx.arc(0, 0, 18 + Math.sin(state.elapsed * 3) * 2, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function drawEnemy(enemy) {
    const def = ENEMIES[enemy.type];
    const p = gridToScreen(enemy.x, enemy.y);
    const fly = def.flying ? -31 + Math.sin(state.elapsed * 5 + enemy.bob) * 4 : 0;
    ctx.save();
    ctx.translate(p.x, p.y - 8 + fly);
    if (enemy.flash > 0) ctx.globalAlpha = 0.55 + enemy.flash * 0.45;

    if (def.flying) {
      ctx.globalAlpha *= 0.23;
      ctx.fillStyle = '#000'; ellipse(0, 40, 20, 6); ctx.fill();
      ctx.globalAlpha = enemy.flash > 0 ? 0.75 : 1;
    } else {
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ellipse(0, 12, enemy.type === 'tank' || enemy.type === 'truck' ? 21 : 13, 6); ctx.fill();
    }

    ctx.rotate(enemy.rotation * 0.52);
    if (enemy.type === 'infantry') drawInfantry(def);
    else if (enemy.type === 'tank') drawTank(def);
    else if (enemy.type === 'fpv') drawFPV(def);
    else if (enemy.type === 'truck') drawTruck(def);
    else drawDrone(def);
    ctx.rotate(-enemy.rotation * 0.52);
    drawHealthBar(0, fly ? -24 : -31, enemy.type === 'tank' || enemy.type === 'truck' ? 40 : 29, enemy.hp / enemy.maxHp, def.color);
    if (enemy.slowTimer > 0) {
      ctx.strokeStyle = '#d792ff'; ctx.lineWidth = 2; ctx.globalAlpha = .7;
      ctx.beginPath(); ctx.arc(0, 5, 16, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function drawInfantry(def) {
    ctx.fillStyle = '#39445a'; ctx.fillRect(-5, -3, 10, 17);
    ctx.fillStyle = def.color; ctx.beginPath(); ctx.arc(0, -7, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#20283a'; ctx.fillRect(3, -2, 14, 4);
  }

  function drawTank(def) {
    ctx.fillStyle = '#344338'; roundRect(-20, -9, 40, 22, 6); ctx.fill();
    ctx.fillStyle = def.color; roundRect(-12, -15, 24, 16, 5); ctx.fill();
    ctx.fillStyle = '#202a23'; ctx.fillRect(5, -11, 24, 5);
    ctx.fillStyle = '#1c271f'; ctx.fillRect(-20, 10, 40, 5);
  }

  function drawFPV(def) {
    ctx.fillStyle = '#3b4158'; ctx.fillRect(-6, -2, 12, 17);
    ctx.fillStyle = def.color; ctx.beginPath(); ctx.arc(0, -7, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffb3d0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(6,-5); ctx.lineTo(17,-13); ctx.moveTo(10,-9); ctx.lineTo(19,-4); ctx.stroke();
  }

  function drawTruck(def) {
    ctx.fillStyle = def.color; roundRect(-22, -9, 35, 22, 5); ctx.fill();
    ctx.fillStyle = '#a85938'; roundRect(10, -6, 15, 19, 4); ctx.fill();
    ctx.fillStyle = '#a6d7e6'; ctx.fillRect(14, -3, 8, 6);
    ctx.fillStyle = '#202735'; ctx.beginPath(); ctx.arc(-12, 13, 5, 0, Math.PI*2); ctx.arc(17, 13, 5, 0, Math.PI*2); ctx.fill();
  }

  function drawDrone(def) {
    ctx.strokeStyle = '#2d3b55'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-18,-8); ctx.lineTo(18,8); ctx.moveTo(18,-8); ctx.lineTo(-18,8); ctx.stroke();
    ctx.fillStyle = def.color; roundRect(-10,-7,20,14,5); ctx.fill();
    ctx.strokeStyle = '#b7d7ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(-18,-8,8,0,Math.PI*2); ctx.arc(18,-8,8,0,Math.PI*2); ctx.arc(-18,8,8,0,Math.PI*2); ctx.arc(18,8,8,0,Math.PI*2); ctx.stroke();
  }

  function drawProjectiles() {
    for (const p of state.projectiles) {
      if (p.kind === 'rocket') {
        p.trail.forEach(t => {
          const sp = gridToScreen(t.x, t.y);
          ctx.save(); ctx.globalAlpha = t.life / 0.3 * 0.45; ctx.fillStyle = '#ffbf79';
          ctx.beginPath(); ctx.arc(sp.x, sp.y - 26, 4, 0, Math.PI*2); ctx.fill(); ctx.restore();
        });
        const s = gridToScreen(p.x, p.y);
        ctx.save(); ctx.translate(s.x, s.y - 28); ctx.fillStyle = '#fff0d2';
        ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2); ctx.fill(); ctx.restore();
      } else if (p.kind === 'laser') {
        const target = state.enemies.find(e => e.id === p.targetId);
        if (!target) continue;
        drawBeam(p.x, p.y, target.x, target.y, p.color, 3, p.life / p.maxLife);
      } else {
        drawBeam(p.x, p.y, p.tx, p.ty, p.color, p.kind === 'enemyShot' ? 2 : 2.5, p.life / p.maxLife);
      }
    }
  }

  function drawBeam(x1, y1, x2, y2, color, width, alpha) {
    const a = gridToScreen(x1, y1);
    const b = gridToScreen(x2, y2);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(a.x, a.y - 25); ctx.lineTo(b.x, b.y - 18); ctx.stroke();
    ctx.globalAlpha *= 0.35; ctx.lineWidth = width * 3; ctx.stroke();
    ctx.restore();
  }

  function drawRepairDrones() {
    for (const d of state.repairDrones) {
      const p = gridToScreen(d.x, d.y);
      ctx.save(); ctx.translate(p.x, p.y - 48 - Math.sin(d.progress * Math.PI) * 35);
      ctx.strokeStyle = d.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-10,-5); ctx.lineTo(10,5); ctx.moveTo(10,-5); ctx.lineTo(-10,5); ctx.stroke();
      ctx.fillStyle = d.color; roundRect(-6,-5,12,10,3); ctx.fill();
      ctx.restore();
    }
  }

  function drawEffects() {
    for (const e of state.effects) {
      const p = gridToScreen(e.x, e.y);
      const k = 1 - e.life / e.maxLife;
      ctx.save();
      ctx.translate(p.x, p.y - 18 + (e.yOffset || 0));
      if (e.kind === 'float') {
        ctx.globalAlpha = e.life / e.maxLife;
        ctx.font = '700 15px Inter';
        ctx.textAlign = 'center';
        ctx.fillStyle = e.color;
        ctx.fillText(e.text, 0, 0);
      } else if (e.kind === 'explosion' || e.kind === 'enemyDown' || e.kind === 'baseHit') {
        ctx.globalAlpha = Math.max(0, 1 - k);
        ctx.fillStyle = e.color;
        ctx.beginPath(); ctx.arc(0, 0, 6 + k * 32, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha *= 0.35;
        ctx.beginPath(); ctx.arc(0, 0, 12 + k * 48, 0, Math.PI * 2); ctx.fill();
      } else if (e.kind === 'build' || e.kind === 'upgrade' || e.kind === 'repair' || e.kind === 'mine' || e.kind === 'sell') {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(0, 10, 10 + k * 30, 5 + k * 15, 0, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 5; i++) {
          const a = i / 5 * Math.PI * 2 + k * 2;
          ctx.fillStyle = e.color;
          ctx.fillRect(Math.cos(a) * (8 + k * 28) - 2, Math.sin(a) * (4 + k * 16) - 2, 4, 4);
        }
      } else if (e.kind === 'stun') {
        ctx.globalAlpha = 0.35 + Math.sin(e.t * 12) * .2;
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 22 + Math.sin(e.t*7)*4, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawPlacementGhost() {
    if (!selectedBuildType || !hoverTile || !state || state.gameOver) return;
    const valid = isValidPlacement(hoverTile.x, hoverTile.y) && state.ore >= TOWERS[selectedBuildType].cost;
    const p = gridToScreen(hoverTile.x, hoverTile.y);
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = valid ? '#66f0ae' : '#ff6969';
    ctx.beginPath();
    ctx.moveTo(p.x - TILE_W/2, p.y); ctx.lineTo(p.x, p.y+TILE_H/2); ctx.lineTo(p.x+TILE_W/2,p.y); ctx.lineTo(p.x,p.y-TILE_H/2); ctx.closePath(); ctx.fill();
    ctx.translate(p.x, p.y - 15);
    ctx.fillStyle = TOWERS[selectedBuildType].color;
    ctx.beginPath(); ctx.arc(0,0,12,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#071019'; ctx.font = '900 12px Inter'; ctx.textAlign='center'; ctx.fillText(TOWERS[selectedBuildType].symbol,0,4);
    ctx.restore();

    const stats = TOWERS[selectedBuildType];
    if (stats.range > 0) drawIsoRange(hoverTile.x, hoverTile.y, stats.range, valid ? '#66f0ae' : '#ff6969', 0.15);
  }

  function drawRangeOverlay() {
    if (!state || selectedBuildType) return;
    const tower = state.towers.find(t => t.id === state.selectedTowerId);
    if (!tower) return;
    const stats = towerStats(tower);
    if (stats.range > 0) drawIsoRange(tower.gx, tower.gy, stats.range, TOWERS[tower.type].color, 0.11);
    const p = gridToScreen(tower.gx, tower.gy);
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.globalAlpha = .7; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(p.x,p.y+3,28,14,0,0,Math.PI*2); ctx.stroke(); ctx.restore();
  }

  function drawIsoRange(gx, gy, range, color, alpha) {
    const center = gridToScreen(gx, gy);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) {
      const a = i / 48 * Math.PI * 2;
      const gp = gridToScreen(gx + Math.cos(a) * range, gy + Math.sin(a) * range);
      if (i === 0) ctx.moveTo(gp.x, gp.y); else ctx.lineTo(gp.x, gp.y);
    }
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = alpha * 4; ctx.stroke();
    ctx.restore();
  }

  function drawVignette() {
    const g = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 220, canvas.width/2, canvas.height/2, 720);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,.52)');
    ctx.fillStyle = g; ctx.fillRect(0,0,canvas.width,canvas.height);
  }

  function drawRock(x, y, seed) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ellipse(0, 13, 20, 7); ctx.fill();
    ctx.fillStyle = seed % 2 ? '#71483b' : '#654136';
    ctx.beginPath(); ctx.moveTo(-17,10); ctx.lineTo(-10,-8); ctx.lineTo(2,-17); ctx.lineTo(16,-6); ctx.lineTo(19,10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.moveTo(-10,-7); ctx.lineTo(2,-17); ctx.lineTo(3,-3); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawIce(x, y, seed) {
    ctx.save(); ctx.translate(x,y);
    ctx.fillStyle='rgba(0,0,0,.15)'; ellipse(0,12,17,6); ctx.fill();
    ctx.fillStyle = seed%2 ? '#d6f7ff' : '#9ce4f3';
    ctx.beginPath(); ctx.moveTo(-14,9); ctx.lineTo(-5,-18); ctx.lineTo(1,-5); ctx.lineTo(8,-24); ctx.lineTo(15,10); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.55)'; ctx.beginPath(); ctx.moveTo(-5,-18);ctx.lineTo(1,-5);ctx.lineTo(-1,8);ctx.closePath();ctx.fill();
    ctx.restore();
  }

  function drawSwamp(x, y, seed) {
    ctx.save(); ctx.translate(x,y);
    ctx.fillStyle = seed%2 ? '#245f59' : '#2d625e'; ellipse(0,8,22,10); ctx.fill();
    ctx.strokeStyle='#6df0b4';ctx.lineWidth=3;
    for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*8,8);ctx.quadraticCurveTo(i*10-4,-7-seed%5,i*7,-18-seed%7);ctx.stroke();}
    ctx.restore();
  }

  function drawOreCrystal(x, y, seed) {
    ctx.save(); ctx.translate(x,y);
    ctx.fillStyle='rgba(0,0,0,.2)';ellipse(0,12,13,5);ctx.fill();
    ctx.fillStyle='#ffd36d';
    ctx.beginPath();ctx.moveTo(-8,8);ctx.lineTo(-3,-15);ctx.lineTo(4,-4);ctx.lineTo(9,-12);ctx.lineTo(12,9);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.45)';ctx.beginPath();ctx.moveTo(-3,-15);ctx.lineTo(4,-4);ctx.lineTo(0,8);ctx.closePath();ctx.fill();
    ctx.globalAlpha=.14 + Math.sin(state.elapsed*3+seed)*.04;ctx.beginPath();ctx.arc(0,0,19,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }

  function drawHealthBar(x, y, width, ratio, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(-width/2,0,width,5,3);ctx.fill();
    ctx.fillStyle = ratio < .3 ? '#ff6b6b' : color; roundRect(-width/2+1,1,Math.max(0,(width-2)*ratio),3,2);ctx.fill();
    ctx.restore();
  }

  function isoBox(x, y, w, h, depth, top, left, right) {
    ctx.save(); ctx.translate(x,y);
    ctx.fillStyle=top;roundRect(0,-h,w,h,5);ctx.fill();
    ctx.fillStyle=left;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w/2,h/2);ctx.lineTo(w/2,h/2+depth);ctx.lineTo(0,depth);ctx.closePath();ctx.fill();
    ctx.fillStyle=right;ctx.beginPath();ctx.moveTo(w,0);ctx.lineTo(w/2,h/2);ctx.lineTo(w/2,h/2+depth);ctx.lineTo(w,depth);ctx.closePath();ctx.fill();
    ctx.restore();
  }

  function roundRect(x,y,w,h,r){
    if(w<0){x+=w;w=-w;} if(h<0){y+=h;h=-h;}
    const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();
  }

  function ellipse(x,y,rx,ry){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);}
  function distance(x1,y1,x2,y2){return Math.hypot(x2-x1,y2-y1);}
  function lerp(a,b,t){return a+(b-a)*t;}
  function easeInOut(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}

  function shade(hex, amount) {
    const c = hex.replace('#','');
    const n = parseInt(c.length===3?c.split('').map(x=>x+x).join(''):c,16);
    const r=Math.max(0,Math.min(255,(n>>16)+amount));
    const g=Math.max(0,Math.min(255,((n>>8)&255)+amount));
    const b=Math.max(0,Math.min(255,(n&255)+amount));
    return `rgb(${r},${g},${b})`;
  }

  function initAudio() {
    if (!soundOn || audioCtx) return;
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { soundOn = false; }
  }

  function beep(freq, duration, gain) {
    if (!soundOn) return;
    initAudio();
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(gain, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(g); g.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + duration);
    } catch (_) { /* audio is optional */ }
  }

  init();
})();
