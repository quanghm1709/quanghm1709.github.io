(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const ui = {
    playerHpFill: document.getElementById('player-hp-fill'),
    enemyHpFill: document.getElementById('enemy-hp-fill'),
    playerHpText: document.getElementById('player-hp-text'),
    enemyHpText: document.getElementById('enemy-hp-text'),
    timer: document.getElementById('timer'),
    phase: document.getElementById('phase-label'),
    energyText: document.getElementById('energy-text'),
    energyFill: document.getElementById('energy-fill'),
    regen: document.getElementById('regen-label'),
    dock: document.getElementById('card-dock'),
    drag: document.getElementById('drag-card'),
    tip: document.getElementById('tip'),
    deckStatus: document.getElementById('deck-status'),
    result: document.getElementById('result-screen'),
    resultTitle: document.getElementById('result-title'),
    resultSubtitle: document.getElementById('result-subtitle'),
    resultKicker: document.getElementById('result-kicker'),
    statDamage: document.getElementById('stat-damage'),
    statUnits: document.getElementById('stat-units'),
    statEnergy: document.getElementById('stat-energy'),
    restart: document.getElementById('restart-btn'),
    pause: document.getElementById('pause-btn'),
    sound: document.getElementById('sound-btn'),
    pauseScreen: document.getElementById('pause-screen'),
  };

  // ---------------------------------------------------------------------------
  // BALANCE DATA
  // ---------------------------------------------------------------------------
  const UNIT_TYPES = {
    rifleman: { id:'rifleman', name:'RIFLEMAN', role:'Ranged · Basic DPS', cost:2, hp:110, damage:16, attackRate:1.15, range:145, moveSpeed:42, radius:20, preferredGap:38, weapon:'rifle' },
    assault:  { id:'assault', name:'ASSAULT', role:'Melee · Frontline', cost:3, hp:280, damage:34, attackRate:.90, range:31, moveSpeed:56, radius:23, preferredGap:42, weapon:'melee' },
    heavy:    { id:'heavy', name:'HEAVY', role:'Melee · Tank', cost:5, hp:760, damage:30, attackRate:.78, range:34, moveSpeed:29, radius:28, preferredGap:51, weapon:'heavy' },
    gunner:   { id:'gunner', name:'MACHINE GUNNER', role:'Ranged · Sustained DPS', cost:4, hp:200, damage:8, attackRate:4.5, range:132, moveSpeed:34, radius:22, preferredGap:42, weapon:'mg' },
    sniper:   { id:'sniper', name:'SNIPER', role:'Ranged · Anti backline', cost:4, hp:95, damage:132, attackRate:.38, range:255, moveSpeed:31, radius:18, preferredGap:38, weapon:'sniper' },
    shotgun:  { id:'shotgun', name:'SHOTGUN', role:'Close · Anti swarm', cost:3, hp:220, damage:64, attackRate:.78, range:78, moveSpeed:44, radius:22, preferredGap:40, weapon:'shotgun', splash:46, splashScale:.48 },
    rocket:   { id:'rocket', name:'ROCKET', role:'Ranged · AOE', cost:6, hp:160, damage:122, attackRate:.44, range:210, moveSpeed:30, radius:21, preferredGap:42, weapon:'rocket', splash:82, splashScale:.62 },
    shield:   { id:'shield', name:'SHIELD', role:'Melee · Anti ranged', cost:4, hp:520, damage:19, attackRate:.84, range:30, moveSpeed:40, radius:26, preferredGap:48, weapon:'shield', rangedResist:.48 },
    jeep:     { id:'jeep', name:'SCOUT JEEP', role:'Vehicle · Fast flanker', cost:4, hp:390, damage:13, attackRate:3.0, range:145, moveSpeed:82, radius:31, preferredGap:58, weapon:'mg', vehicle:'jeep' },
    apc:      { id:'apc', name:'APC', role:'Vehicle · Armored push', cost:6, hp:860, damage:22, attackRate:1.55, range:120, moveSpeed:48, radius:38, preferredGap:70, weapon:'mg', vehicle:'apc' },
    tank:     { id:'tank', name:'BATTLE TANK', role:'Vehicle · Heavy AOE', cost:7, hp:1220, damage:88, attackRate:.56, range:185, moveSpeed:27, radius:44, preferredGap:78, weapon:'cannon', vehicle:'tank', splash:72, splashScale:.55 },
  };

  const STRUCT_TYPES = {
    turret:    { id:'turret', name:'FIELD TURRET', hp:640, radius:35, range:220, damage:20, attackRate:2.3, icon:'TURRET', description:'Phòng thủ tự động, ưu tiên mục tiêu gần.' },
    generator: { id:'generator', name:'GENERATOR', hp:520, radius:38, energyBonus:.22, icon:'GEN', description:'+0.22 Energy/s khi còn hoạt động.' },
    barracks:  { id:'barracks', name:'BARRACKS', hp:680, radius:42, spawnEvery:8.0, icon:'HQ', description:'Triệu hồi Rifleman miễn phí mỗi 8 giây.' },
  };

  const SUPPORT_TYPES = {
    bombing: { id:'bombing', name:'AIRSTRIKE', radius:100, damage:270, icon:'BOMB', description:'Nổ diện rộng, gây 270 sát thương.' },
    mine:    { id:'mine', name:'LAND MINE', radius:72, damage:190, trigger:34, icon:'MINE', description:'Đặt mìn. Nổ khi địch tiến vào.' },
    rush:    { id:'rush', name:'RUSH ORDER', radius:150, duration:7, icon:'>>', description:'+55% tốc chạy cho quân đồng minh trong vùng.' },
    freeze:  { id:'freeze', name:'FREEZE SHELL', radius:135, duration:4, icon:'ICE', description:'Đóng băng quân địch trong vùng 4 giây.' },
  };

  const CARD_DEFS = {
    rifleman: { id:'rifleman', type:'unit', ref:'rifleman', name:'RIFLEMAN', cost:2, icon:'R', subtitle:'Basic DPS' },
    assault:  { id:'assault', type:'unit', ref:'assault', name:'ASSAULT', cost:3, icon:'A', subtitle:'Frontline' },
    heavy:    { id:'heavy', type:'unit', ref:'heavy', name:'HEAVY', cost:5, icon:'H', subtitle:'Tank' },
    gunner:   { id:'gunner', type:'unit', ref:'gunner', name:'MACHINE GUNNER', cost:4, icon:'MG', subtitle:'Sustained DPS' },
    sniper:   { id:'sniper', type:'unit', ref:'sniper', name:'SNIPER', cost:4, icon:'SN', subtitle:'Long range' },
    shotgun:  { id:'shotgun', type:'unit', ref:'shotgun', name:'SHOTGUN', cost:3, icon:'SG', subtitle:'Anti swarm' },
    rocket:   { id:'rocket', type:'unit', ref:'rocket', name:'ROCKET', cost:6, icon:'RPG', subtitle:'AOE' },
    shield:   { id:'shield', type:'unit', ref:'shield', name:'SHIELD', cost:4, icon:'SH', subtitle:'Anti ranged' },
    jeep:     { id:'jeep', type:'unit', ref:'jeep', name:'SCOUT JEEP', cost:4, icon:'JEEP', subtitle:'Fast vehicle' },
    apc:      { id:'apc', type:'unit', ref:'apc', name:'APC', cost:6, icon:'APC', subtitle:'Armored push' },
    tank:     { id:'tank', type:'unit', ref:'tank', name:'BATTLE TANK', cost:7, icon:'TANK', subtitle:'Heavy AOE' },

    turret:    { id:'turret', type:'struct', ref:'turret', name:'FIELD TURRET', cost:4, icon:'TURRET', subtitle:'Defense' },
    generator: { id:'generator', type:'struct', ref:'generator', name:'GENERATOR', cost:4, icon:'GEN', subtitle:'Energy +' },
    barracks:  { id:'barracks', type:'struct', ref:'barracks', name:'BARRACKS', cost:5, icon:'HQ', subtitle:'Free units' },

    bombing: { id:'bombing', type:'support', ref:'bombing', name:'AIRSTRIKE', cost:4, icon:'BOMB', subtitle:'AOE damage' },
    mine:    { id:'mine', type:'support', ref:'mine', name:'LAND MINE', cost:2, icon:'MINE', subtitle:'Trap' },
    rush:    { id:'rush', type:'support', ref:'rush', name:'RUSH ORDER', cost:3, icon:'>>', subtitle:'Move speed +' },
    freeze:  { id:'freeze', type:'support', ref:'freeze', name:'FREEZE SHELL', cost:4, icon:'ICE', subtitle:'Enemy freeze' },
  };

  // One copy of each card. When the draw pile is empty, the discard pile is shuffled back in.
  const MASTER_DECK = Object.keys(CARD_DEFS);

  const CONFIG = {
    maxEnergy:10,
    startingEnergy:5,
    baseHp:3000,
    battleSeconds:240,
    handSize:4,
    playerSpawnX:225,
    enemySpawnX:1310,
    playerBaseX:170,
    enemyBaseX:1368,
    laneMinY:365,
    laneMaxY:785,
    dropMinY:235,
    dropMaxY:820,
    structMinX:275,
    structMaxX:710,
    aiThinkMin:1.15,
    aiThinkMax:2.2,
    turretRange:190,
    turretDamage:30,
    turretRate:.82,
    unitCapPerSide:55,
    structureCap:6,
  };

  // ---------------------------------------------------------------------------
  // RUNTIME STATE
  // ---------------------------------------------------------------------------
  let units = [];
  let structures = [];
  let mines = [];
  let particles = [];
  let tracers = [];
  let areaFx = [];
  let game;
  let uid = 0;
  let lastTime = performance.now();
  let dragging = null;
  let audioCtx = null;
  let muted = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i=a.length-1; i>0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  function resetGame() {
    units = [];
    structures = [];
    mines = [];
    particles = [];
    tracers = [];
    areaFx = [];
    uid = 0;
    dragging = null;
    ui.drag.classList.add('hidden');
    game = {
      running:true,
      paused:false,
      elapsed:0,
      remaining:CONFIG.battleSeconds,
      playerHp:CONFIG.baseHp,
      enemyHp:CONFIG.baseHp,
      playerEnergy:CONFIG.startingEnergy,
      enemyEnergy:CONFIG.startingEnergy,
      aiTimer:1.4,
      playerTurretCd:0,
      enemyTurretCd:0,
      firstDeploy:false,
      drawPile:shuffle(MASTER_DECK),
      discard:[],
      hand:[],
      stats:{damage:0, units:0, energy:0, structures:0, support:0},
      flashPlayerBase:0,
      flashEnemyBase:0,
      shake:0,
      message:'',
      messageTimer:0,
    };
    while (game.hand.length < CONFIG.handSize) drawCard();
    ui.result.classList.add('hidden');
    ui.pauseScreen.classList.add('hidden');
    ui.tip.style.opacity='1';
    updateHUD();
    renderCards();
  }

  // ---------------------------------------------------------------------------
  // AUDIO
  // ---------------------------------------------------------------------------
  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function blip(type, strength=1) {
    if (muted) return;
    ensureAudio();
    const now=audioCtx.currentTime;
    const osc=audioCtx.createOscillator();
    const gain=audioCtx.createGain();
    const filter=audioCtx.createBiquadFilter();
    osc.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    let freq=160, duration=.06, wave='square';
    if(type==='shot'){freq=190+Math.random()*65; duration=.035; wave='square'; filter.frequency.value=1800;}
    if(type==='mg'){freq=115+Math.random()*40; duration=.025; wave='sawtooth'; filter.frequency.value=1300;}
    if(type==='melee'){freq=95; duration=.05; wave='triangle'; filter.frequency.value=900;}
    if(type==='deploy'){freq=360; duration=.08; wave='triangle'; filter.frequency.value=2200;}
    if(type==='base'){freq=58; duration=.16; wave='sawtooth'; filter.frequency.value=650;}
    if(type==='boom'){freq=46; duration=.24; wave='sawtooth'; filter.frequency.value=520;}
    if(type==='support'){freq=470; duration=.12; wave='triangle'; filter.frequency.value=1900;}
    osc.type=wave; osc.frequency.setValueAtTime(freq,now);
    gain.gain.setValueAtTime(.035*strength,now);
    gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    osc.start(now); osc.stop(now+duration);
  }

  // ---------------------------------------------------------------------------
  // DECK / HAND / CARDS
  // ---------------------------------------------------------------------------
  function recycleDiscard() {
    if (game.drawPile.length || !game.discard.length) return;
    game.drawPile = shuffle(game.discard);
    game.discard = [];
  }

  function drawCard() {
    recycleDiscard();
    if (!game.drawPile.length) return null;
    const id = game.drawPile.pop();
    game.hand.push(id);
    return id;
  }

  function cyclePlayedCard(cardId) {
    const idx=game.hand.indexOf(cardId);
    if(idx<0) return;
    game.hand.splice(idx,1);
    game.discard.push(cardId);
    drawCard();
    renderCards();
  }

  function cardDetails(card) {
    if(card.type==='unit') {
      const d=UNIT_TYPES[card.ref];
      return `HP ${d.hp} · DMG ${d.damage}`;
    }
    if(card.type==='struct') {
      const d=STRUCT_TYPES[card.ref];
      if(card.ref==='turret') return `HP ${d.hp} · RNG ${d.range}`;
      if(card.ref==='generator') return `HP ${d.hp} · +${d.energyBonus.toFixed(2)}/s`;
      return `HP ${d.hp} · ${d.spawnEvery}s spawn`;
    }
    const d=SUPPORT_TYPES[card.ref];
    if(card.ref==='bombing') return `DMG ${d.damage} · AOE ${d.radius}`;
    if(card.ref==='mine') return `DMG ${d.damage} · TRAP`;
    return `${d.duration}s · AOE ${d.radius}`;
  }

  function renderCards() {
    ui.dock.innerHTML='';
    game.hand.forEach((id,index)=>{
      const def=CARD_DEFS[id];
      const el=document.createElement('article');
      el.className=`unit-card card-${def.type}`;
      el.dataset.id=id;
      el.innerHTML=`
        <div class="card-cost">${def.cost}</div>
        <div class="card-type">${def.type.toUpperCase()}</div>
        <div class="card-art"><div class="card-icon">${def.icon}</div></div>
        <div class="card-meta">
          <div class="card-name">${def.name}</div>
          <div class="card-role">${def.subtitle}</div>
          <div class="card-statline"><span>${cardDetails(def)}</span><span>#${index+1}</span></div>
        </div>`;
      el.addEventListener('pointerdown',e=>startDrag(e,id,el));
      ui.dock.appendChild(el);
    });
    updateCardAvailability();
    updateDeckStatus();
  }

  function updateDeckStatus() {
    if(!ui.deckStatus || !game) return;
    ui.deckStatus.innerHTML=`<span><b>${game.drawPile.length}</b> DRAW</span><i>•</i><span><b>${game.discard.length}</b> DISCARD</span>`;
  }

  function updateCardAvailability() {
    [...ui.dock.querySelectorAll('.unit-card')].forEach(el=>{
      const def=CARD_DEFS[el.dataset.id];
      el.classList.toggle('disabled',game.playerEnergy+1e-4<def.cost || !game.running || game.paused);
    });
  }

  function startDrag(e,id,cardEl) {
    if(!game.running || game.paused) return;
    const def=CARD_DEFS[id];
    if(game.playerEnergy<def.cost){flashMessage(`Cần ${def.cost} Energy`); return;}
    ensureAudio();
    dragging={cardId:id,pointerId:e.pointerId,cardEl,x:e.clientX,y:e.clientY,world:null};
    cardEl.setPointerCapture?.(e.pointerId);
    ui.drag.className=`drag-card drag-${def.type}`;
    ui.drag.innerHTML=`<div class="drag-cost">${def.cost}</div><div class="drag-type">${def.type.toUpperCase()}</div><div class="drag-name">${def.name}</div>`;
    ui.drag.classList.remove('hidden');
    moveDrag(e);
    e.preventDefault();
  }

  function moveDrag(e) {
    if(!dragging || e.pointerId!==dragging.pointerId) return;
    dragging.x=e.clientX; dragging.y=e.clientY;
    ui.drag.style.left=`${e.clientX}px`; ui.drag.style.top=`${e.clientY}px`;
    dragging.world=clientToWorld(e.clientX,e.clientY);
    e.preventDefault();
  }

  function endDrag(e) {
    if(!dragging || e.pointerId!==dragging.pointerId) return;
    const d=dragging;
    dragging=null;
    ui.drag.classList.add('hidden');
    const p=clientToWorld(e.clientX,e.clientY);
    if(insideBattlefield(p.x,p.y)) playCard(d.cardId,p.x,p.y);
    else flashMessage('Thả lá bài vào chiến trường');
  }

  window.addEventListener('pointermove',moveDrag,{passive:false});
  window.addEventListener('pointerup',endDrag,{passive:false});
  window.addEventListener('pointercancel',endDrag,{passive:false});

  function clientToWorld(clientX,clientY) {
    const r=canvas.getBoundingClientRect();
    return {x:(clientX-r.left)/r.width*W, y:(clientY-r.top)/r.height*H};
  }

  function insideBattlefield(x,y) {
    return x>=0 && x<=W && y>=CONFIG.dropMinY && y<=CONFIG.dropMaxY;
  }

  function validStructurePlacement(x,y,quiet=false) {
    if(x<CONFIG.structMinX || x>CONFIG.structMaxX || y<CONFIG.laneMinY || y>CONFIG.laneMaxY) {
      if(!quiet) flashMessage('Công trình chỉ đặt được ở vùng phòng thủ bên trái');
      return false;
    }
    if(structures.filter(s=>!s.dead&&s.side==='player').length>=CONFIG.structureCap) {
      if(!quiet) flashMessage(`Tối đa ${CONFIG.structureCap} công trình`);
      return false;
    }
    for(const s of structures) {
      if(!s.dead && Math.hypot(s.x-x,(s.y-y)*.8)<92) {
        if(!quiet) flashMessage('Vị trí quá gần công trình khác');
        return false;
      }
    }
    return true;
  }

  function playCard(cardId,x,y) {
    const card=CARD_DEFS[cardId];
    if(!card || !game.hand.includes(cardId) || !game.running) return false;
    if(game.playerEnergy<card.cost){flashMessage(`Cần ${card.cost} Energy`);return false;}
    let success=false;
    if(card.type==='unit') success=deployPlayerUnit(card.ref,y);
    else if(card.type==='struct') success=deployStructure(card.ref,x,y);
    else if(card.type==='support') success=castSupport(card.ref,x,y);
    if(!success) return false;

    game.playerEnergy-=card.cost;
    game.stats.energy+=card.cost;
    game.firstDeploy=true;
    ui.tip.style.opacity='0';
    cyclePlayedCard(cardId);
    updateHUD();
    return true;
  }

  // ---------------------------------------------------------------------------
  // SPAWNING
  // ---------------------------------------------------------------------------
  function normalizeLane(y){return Math.max(CONFIG.laneMinY,Math.min(CONFIG.laneMaxY,y));}
  function sideCount(side){return units.reduce((n,u)=>n+(u.side===side&&!u.dead?1:0),0);}

  function spawnUnit(typeId,side,laneY,customX=null,free=false) {
    if(sideCount(side)>=CONFIG.unitCapPerSide) return null;
    const d=UNIT_TYPES[typeId];
    const unit={
      kind:'unit', uid:++uid, typeId, side, def:d,
      x:customX ?? (side==='player'?CONFIG.playerSpawnX:CONFIG.enemySpawnX),
      y:normalizeLane(laneY)+(Math.random()-.5)*13,
      hp:d.hp,maxHp:d.hp,attackCd:Math.random()*.18,target:null,dead:false,deathT:0,
      hitFlash:0,muzzleFlash:0,walkT:Math.random()*10,facing:side==='player'?1:-1,justHit:0,
      freezeTimer:0,speedBoostTimer:0,
    };
    units.push(unit); spawnDust(unit.x,unit.y,6); blip('deploy',free?.45:.72);
    return unit;
  }

  function deployPlayerUnit(typeId,dropY) {
    if(sideCount('player')>=CONFIG.unitCapPerSide){flashMessage('Đã đạt giới hạn quân');return false;}
    const u=spawnUnit(typeId,'player',dropY);
    if(!u) return false;
    game.stats.units++;
    return true;
  }

  function deployStructure(typeId,x,y) {
    if(!validStructurePlacement(x,y)) return false;
    const d=STRUCT_TYPES[typeId];
    const s={kind:'structure',uid:++uid,typeId,side:'player',def:d,x,y:normalizeLane(y),hp:d.hp,maxHp:d.hp,dead:false,deathT:0,attackCd:0,spawnCd:typeId==='barracks'?2.5:0,hitFlash:0,muzzleFlash:0};
    structures.push(s); spawnDust(x,y,14); blip('deploy',.9); game.stats.structures++;
    return true;
  }

  function castSupport(typeId,x,y) {
    const d=SUPPORT_TYPES[typeId];
    x=Math.max(210,Math.min(1325,x)); y=normalizeLane(y);
    if(typeId==='bombing') {
      areaFx.push({kind:'bomb',x,y,r:d.radius,life:.7,max:.7});
      damageArea('enemy',x,y,d.radius,d.damage,null);
      spawnImpact(x,y,28); spawnDust(x,y,18); game.shake=Math.max(game.shake,9); blip('boom',1.2);
    } else if(typeId==='mine') {
      mines.push({uid:++uid,x,y,side:'player',def:d,armed:.45,dead:false});
      areaFx.push({kind:'place',x,y,r:40,life:.45,max:.45}); blip('support',.7);
    } else if(typeId==='rush') {
      for(const u of units) if(!u.dead&&u.side==='player'&&Math.hypot(u.x-x,(u.y-y)*.8)<=d.radius) u.speedBoostTimer=Math.max(u.speedBoostTimer,d.duration);
      areaFx.push({kind:'rush',x,y,r:d.radius,life:1,max:1}); blip('support',.85);
    } else if(typeId==='freeze') {
      for(const u of units) if(!u.dead&&u.side==='enemy'&&Math.hypot(u.x-x,(u.y-y)*.8)<=d.radius) u.freezeTimer=Math.max(u.freezeTimer,d.duration);
      areaFx.push({kind:'freeze',x,y,r:d.radius,life:1.05,max:1.05}); blip('support',.9);
    }
    game.stats.support++;
    return true;
  }

  // ---------------------------------------------------------------------------
  // ENEMY AI
  // ---------------------------------------------------------------------------
  function aiThink() {
    if(!game.running) return;
    const alivePlayer=units.filter(u=>u.side==='player'&&!u.dead);
    const ranged=alivePlayer.filter(u=>u.def.range>90).length;
    const melee=alivePlayer.length-ranged;
    const ids=['rifleman','assault','heavy','gunner','sniper','shotgun','rocket','shield','jeep','apc','tank'];
    const pool=ids.filter(id=>UNIT_TYPES[id].cost<=game.enemyEnergy).map(id=>{
      let w=1;
      if(id==='assault')w+=ranged*.18;
      if(id==='rocket'||id==='shotgun')w+=Math.max(0,alivePlayer.length-4)*.12;
      if(id==='gunner'||id==='sniper')w+=melee*.08;
      if(id==='tank')w=.45+Math.max(0,game.elapsed-90)/180;
      if(id==='jeep')w=1.25;
      return [id,w];
    });
    if(!pool.length) return;
    let total=pool.reduce((s,p)=>s+p[1],0),roll=Math.random()*total,selected=pool[0][0];
    for(const [id,w] of pool){roll-=w;if(roll<=0){selected=id;break;}}
    const focusYs=alivePlayer.slice(-9).map(u=>u.y);
    const focusY=focusYs.length?focusYs.reduce((a,b)=>a+b,0)/focusYs.length:530+Math.random()*120;
    const laneY=normalizeLane(focusY+(Math.random()-.5)*190);
    if(sideCount('enemy')<CONFIG.unitCapPerSide){game.enemyEnergy-=UNIT_TYPES[selected].cost;spawnUnit(selected,'enemy',laneY);}
  }

  // ---------------------------------------------------------------------------
  // SIMULATION
  // ---------------------------------------------------------------------------
  function baseEnergyRegen() {
    if(game.elapsed>=180)return 1.5;
    if(game.elapsed>=120)return 1.0;
    return .5;
  }

  function structureEnergyBonus() {
    return structures.reduce((sum,s)=>sum+(!s.dead&&s.side==='player'&&s.typeId==='generator'?s.def.energyBonus:0),0);
  }

  function energyRegen(){return baseEnergyRegen()+structureEnergyBonus();}

  function update(dt) {
    if(!game.running||game.paused)return;
    game.elapsed+=dt; game.remaining=Math.max(0,CONFIG.battleSeconds-game.elapsed);
    const regen=energyRegen();
    game.playerEnergy=Math.min(CONFIG.maxEnergy,game.playerEnergy+regen*dt);
    game.enemyEnergy=Math.min(CONFIG.maxEnergy,game.enemyEnergy+baseEnergyRegen()*dt);

    game.aiTimer-=dt;
    if(game.aiTimer<=0){aiThink();game.aiTimer=CONFIG.aiThinkMin+Math.random()*(CONFIG.aiThinkMax-CONFIG.aiThinkMin);}
    game.playerTurretCd-=dt; game.enemyTurretCd-=dt;
    game.flashPlayerBase=Math.max(0,game.flashPlayerBase-dt*2.3);
    game.flashEnemyBase=Math.max(0,game.flashEnemyBase-dt*2.3);
    game.shake=Math.max(0,game.shake-dt*12); game.messageTimer=Math.max(0,game.messageTimer-dt);

    for(const u of units) {
      if(u.dead){u.deathT+=dt;continue;}
      u.hitFlash=Math.max(0,u.hitFlash-dt*5);u.muzzleFlash=Math.max(0,u.muzzleFlash-dt*14);u.justHit=Math.max(0,u.justHit-dt*4);
      u.freezeTimer=Math.max(0,u.freezeTimer-dt);u.speedBoostTimer=Math.max(0,u.speedBoostTimer-dt);
      if(u.freezeTimer>0) continue;
      u.attackCd-=dt;u.walkT+=dt*(1.9+u.def.moveSpeed/50);
      if(!u.target||u.target.dead||u.target.hp<=0||Math.abs(u.target.y-u.y)>140)u.target=findTarget(u);

      const baseX=u.side==='player'?CONFIG.enemyBaseX:CONFIG.playerBaseX;
      const enemyDir=u.side==='player'?1:-1;
      let engaged=false;
      if(u.target&&!u.target.dead) {
        const dx=u.target.x-u.x,dy=u.target.y-u.y,dist=Math.hypot(dx,dy*.8);
        const combatRange=u.def.range+(u.target.def.radius||25)*.55;
        if(dist<=combatRange){engaged=true;u.facing=Math.sign(dx)||enemyDir;if(u.attackCd<=0)attackEntity(u,u.target);}
      }
      const distToBase=Math.abs(baseX-u.x);
      if(!engaged&&distToBase<=u.def.range+42){engaged=true;u.facing=enemyDir;if(u.attackCd<=0)attackBase(u);}

      if(!engaged) {
        const speed=u.def.moveSpeed*(u.speedBoostTimer>0?1.55:1);
        let vx=enemyDir*speed,vy=0;
        if(u.target){const dy=u.target.y-u.y;vy+=Math.max(-18,Math.min(18,dy*.12));}
        for(const other of units){
          if(other===u||other.dead||other.side!==u.side)continue;
          const dx=u.x-other.x,dy=u.y-other.y,dist2=dx*dx+dy*dy,minD=u.def.preferredGap+other.def.radius*.45;
          if(dist2>.01&&dist2<minD*minD){const dist=Math.sqrt(dist2),push=(1-dist/minD)*24;vx+=(dx/dist)*push;vy+=(dy/dist)*push*1.4;}
        }
        u.x+=vx*dt;u.y+=vy*dt;u.y=normalizeLane(u.y);
      }
    }

    updateStructures(dt);
    updateMines(dt);
    updateBaseTurrets();
    updateFx(dt);
    cleanupDead();

    if(game.playerHp<=0)finish(false,'Your forward base was destroyed.');
    else if(game.enemyHp<=0)finish(true,'Enemy base destroyed.');
    else if(game.remaining<=0){
      if(game.playerHp===game.enemyHp)finish(false,'Time expired — draw resolved as a defensive loss.');
      else finish(game.playerHp>game.enemyHp,'Time expired — higher base HP wins.');
    }
    updateHUD();
  }

  function findTarget(u) {
    let best=null,bestScore=Infinity;
    const candidates=units.concat(structures);
    for(const e of candidates){
      if(e.dead||e.side===u.side)continue;
      const dx=e.x-u.x;
      if(u.side==='player'&&dx<-55)continue;
      if(u.side==='enemy'&&dx>55)continue;
      const dy=Math.abs(e.y-u.y);if(dy>140)continue;
      let score=Math.abs(dx)+dy*1.65;
      if(e.kind==='structure')score*=.92;
      if(score<bestScore){bestScore=score;best=e;}
    }
    return best;
  }

  function calculateDamage(attacker,target,raw) {
    let dmg=raw;
    if(attacker.typeId==='gunner')dmg*=.85+Math.random()*.3;
    if(target.kind==='unit'&&target.def.rangedResist&&attacker.def.range>70)dmg*=target.def.rangedResist;
    return dmg;
  }

  function dealDamageToEntity(target,amount,sourceSide=null) {
    if(!target||target.dead)return;
    target.hp-=amount;target.hitFlash=1;target.justHit=1;
    if(sourceSide==='player')game.stats.damage+=Math.round(amount);
    if(target.hp<=0)killEntity(target);
  }

  function damageArea(enemySide,x,y,radius,damage,attacker=null) {
    const candidates=units.concat(structures);
    for(const t of candidates){
      if(t.dead||t.side!==enemySide)continue;
      const dist=Math.hypot(t.x-x,(t.y-y)*.8);if(dist>radius)continue;
      const falloff=.7+.3*(1-dist/radius);
      const dmg=attacker?calculateDamage(attacker,t,damage*falloff):damage*falloff;
      dealDamageToEntity(t,dmg,attacker?.side||'player');
      spawnImpact(t.x,t.y-20,5);
    }
  }

  function attackEntity(attacker,target) {
    attacker.attackCd=1/attacker.def.attackRate;attacker.muzzleFlash=1;
    const dmg=calculateDamage(attacker,target,attacker.def.damage);
    dealDamageToEntity(target,dmg,attacker.side);
    if(attacker.def.splash){
      const enemySide=attacker.side==='player'?'enemy':'player';
      for(const t of units.concat(structures)){
        if(t===target||t.dead||t.side!==enemySide)continue;
        if(Math.hypot(t.x-target.x,(t.y-target.y)*.8)<=attacker.def.splash){
          dealDamageToEntity(t,calculateDamage(attacker,t,attacker.def.damage*(attacker.def.splashScale||.5)),attacker.side);
        }
      }
      areaFx.push({kind:'blast',x:target.x,y:target.y,r:attacker.def.splash,life:.25,max:.25});
    }
    if(attacker.def.range>70){
      tracers.push({x1:attacker.x+attacker.facing*15,y1:attacker.y-32,x2:target.x,y2:target.y-23,life:.075,max:.075,heavy:attacker.typeId==='gunner'||attacker.def.vehicle});
      spawnImpact(target.x,target.y-23,attacker.def.splash?7:3);blip(attacker.typeId==='gunner'?'mg':'shot',.55);
    } else {spawnImpact(target.x-attacker.facing*7,target.y-14,5);blip('melee',.5);}
  }

  function attackBase(attacker) {
    attacker.attackCd=1/attacker.def.attackRate;attacker.muzzleFlash=1;
    const dmg=attacker.def.damage;
    if(attacker.side==='player'){
      game.enemyHp=Math.max(0,game.enemyHp-dmg);game.stats.damage+=Math.round(dmg);game.flashEnemyBase=1;spawnImpact(CONFIG.enemyBaseX,attacker.y-18,attacker.def.range>70?5:8);
    } else {
      game.playerHp=Math.max(0,game.playerHp-dmg);game.flashPlayerBase=1;spawnImpact(CONFIG.playerBaseX,attacker.y-18,attacker.def.range>70?5:8);
    }
    game.shake=Math.max(game.shake,attacker.def.vehicle==='tank'?5:attacker.typeId==='heavy'?4:1.5);
    if(attacker.def.range>70){const tx=attacker.side==='player'?CONFIG.enemyBaseX:CONFIG.playerBaseX;tracers.push({x1:attacker.x,y1:attacker.y-30,x2:tx,y2:attacker.y-30,life:.08,max:.08,heavy:true});blip('shot',.5);}else blip('base',.45);
  }

  function updateStructures(dt) {
    for(const s of structures){
      if(s.dead){s.deathT+=dt;continue;}
      s.hitFlash=Math.max(0,s.hitFlash-dt*5);s.muzzleFlash=Math.max(0,s.muzzleFlash-dt*12);
      if(s.typeId==='turret'){
        s.attackCd-=dt;
        if(s.attackCd<=0){const target=nearestEnemyToPoint(s.side,s.x,s.y,s.def.range);if(target){s.attackCd=1/s.def.attackRate;s.muzzleFlash=1;dealDamageToEntity(target,s.def.damage,s.side);tracers.push({x1:s.x,y1:s.y-46,x2:target.x,y2:target.y-24,life:.09,max:.09,heavy:true});spawnImpact(target.x,target.y-23,4);blip('shot',.55);}}
      } else if(s.typeId==='barracks'){
        s.spawnCd-=dt;
        if(s.spawnCd<=0&&sideCount('player')<CONFIG.unitCapPerSide){s.spawnCd=s.def.spawnEvery;const u=spawnUnit('rifleman','player',s.y,s.x+46,true);if(u){game.stats.units++;flashMessage('Barracks: Rifleman miễn phí');}}
      }
    }
  }

  function updateMines(dt) {
    for(const m of mines){
      if(m.dead)continue;m.armed=Math.max(0,m.armed-dt);if(m.armed>0)continue;
      const t=units.find(u=>!u.dead&&u.side==='enemy'&&Math.hypot(u.x-m.x,(u.y-m.y)*.8)<=m.def.trigger);
      if(t){damageArea('enemy',m.x,m.y,m.def.radius,m.def.damage,null);m.dead=true;areaFx.push({kind:'bomb',x:m.x,y:m.y,r:m.def.radius,life:.55,max:.55});spawnImpact(m.x,m.y,20);spawnDust(m.x,m.y,12);game.shake=Math.max(game.shake,5);blip('boom',.9);}
    }
    mines=mines.filter(m=>!m.dead);
  }

  function nearestEnemyToPoint(ownerSide,x,y,range) {
    const targetSide=ownerSide==='player'?'enemy':'player';let best=null,bestD=range;
    for(const u of units){if(u.dead||u.side!==targetSide)continue;const d=Math.hypot(u.x-x,(u.y-y)*.8);if(d<bestD){bestD=d;best=u;}}
    return best;
  }

  function updateBaseTurrets() {
    if(game.playerTurretCd<=0){const target=nearestToBase('enemy',CONFIG.playerBaseX,CONFIG.turretRange);if(target){turretHit('player',target);game.playerTurretCd=1/CONFIG.turretRate;}}
    if(game.enemyTurretCd<=0){const target=nearestToBase('player',CONFIG.enemyBaseX,CONFIG.turretRange);if(target){turretHit('enemy',target);game.enemyTurretCd=1/CONFIG.turretRate;}}
  }

  function nearestToBase(side,baseX,range){let best=null,bestD=range;for(const u of units){if(u.dead||u.side!==side)continue;const d=Math.abs(u.x-baseX);if(d<bestD){bestD=d;best=u;}}return best;}

  function turretHit(owner,target){
    const sx=owner==='player'?105:1432,sy=390,dmg=CONFIG.turretDamage;
    dealDamageToEntity(target,dmg,owner);tracers.push({x1:sx,y1:sy,x2:target.x,y2:target.y-25,life:.1,max:.1,heavy:true});spawnImpact(target.x,target.y-24,5);blip('shot',.75);
  }

  function killEntity(e){
    if(e.dead)return;e.dead=true;e.deathT=0;e.hp=0;spawnDust(e.x,e.y,e.kind==='structure'?18:10);
  }

  function cleanupDead(){
    units=units.filter(u=>!u.dead||u.deathT<.8);
    structures=structures.filter(s=>!s.dead||s.deathT<1.1);
  }

  // ---------------------------------------------------------------------------
  // FX
  // ---------------------------------------------------------------------------
  function spawnImpact(x,y,count){for(let i=0;i<count;i++)particles.push({kind:'spark',x,y,vx:(Math.random()-.5)*90,vy:(Math.random()-.65)*75,life:.18+Math.random()*.18,max:.36,size:1.8+Math.random()*2.6});}
  function spawnDust(x,y,count){for(let i=0;i<count;i++)particles.push({kind:'dust',x:x+(Math.random()-.5)*30,y:y+(Math.random()-.5)*9,vx:(Math.random()-.5)*35,vy:-5-Math.random()*18,life:.35+Math.random()*.35,max:.7,size:6+Math.random()*14});}
  function updateFx(dt){
    for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.98;p.vy+=(p.kind==='spark'?90:-4)*dt;}particles=particles.filter(p=>p.life>0);
    for(const t of tracers)t.life-=dt;tracers=tracers.filter(t=>t.life>0);
    for(const a of areaFx)a.life-=dt;areaFx=areaFx.filter(a=>a.life>0);
  }

  // ---------------------------------------------------------------------------
  // RENDERING
  // ---------------------------------------------------------------------------
  function draw(){
    ctx.clearRect(0,0,W,H);
    const shakeX=game?.shake?(Math.random()-.5)*game.shake:0,shakeY=game?.shake?(Math.random()-.5)*game.shake*.55:0;
    ctx.save();ctx.translate(shakeX,shakeY);
    drawBattlefieldOverlays();
    drawMines();
    const objects=units.concat(structures).slice().sort((a,b)=>a.y-b.y);
    for(const o of objects){if(o.kind==='unit')drawUnit(o);else drawStructure(o);}
    drawAreaFx();drawTracers();drawParticles();drawBaseDamage();drawMessage();ctx.restore();
  }

  function drawBattlefieldOverlays(){
    if(dragging&&dragging.world&&insideBattlefield(dragging.world.x,dragging.world.y)){
      const card=CARD_DEFS[dragging.cardId],p=dragging.world,y=normalizeLane(p.y);
      ctx.save();
      if(card.type==='unit'){
        const grd=ctx.createLinearGradient(0,0,560,0);grd.addColorStop(0,'rgba(130,180,92,.20)');grd.addColorStop(1,'rgba(130,180,92,0)');ctx.fillStyle=grd;ctx.fillRect(90,CONFIG.laneMinY-40,520,CONFIG.laneMaxY-CONFIG.laneMinY+80);
        ctx.strokeStyle='rgba(221,235,172,.86)';ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(170,y);ctx.lineTo(550,y);ctx.stroke();ctx.setLineDash([]);
        ctx.globalAlpha=.82;drawGhostUnit(225,y,UNIT_TYPES[card.ref]);
      } else if(card.type==='struct'){
        const valid=validStructurePlacement(p.x,p.y,true);ctx.fillStyle=valid?'rgba(99,169,99,.16)':'rgba(196,69,55,.16)';ctx.fillRect(CONFIG.structMinX,CONFIG.laneMinY-25,CONFIG.structMaxX-CONFIG.structMinX,CONFIG.laneMaxY-CONFIG.laneMinY+50);
        ctx.strokeStyle=valid?'rgba(175,233,157,.9)':'rgba(239,116,92,.9)';ctx.lineWidth=3;ctx.setLineDash([10,8]);ctx.strokeRect(CONFIG.structMinX,CONFIG.laneMinY-25,CONFIG.structMaxX-CONFIG.structMinX,CONFIG.laneMaxY-CONFIG.laneMinY+50);ctx.setLineDash([]);
        drawGhostStructure(p.x,y,card.ref,valid);
      } else {
        const d=SUPPORT_TYPES[card.ref];ctx.strokeStyle=card.ref==='freeze'?'rgba(143,214,255,.9)':card.ref==='rush'?'rgba(157,235,125,.9)':'rgba(255,207,103,.9)';ctx.fillStyle=card.ref==='freeze'?'rgba(92,179,231,.12)':card.ref==='rush'?'rgba(130,210,95,.12)':'rgba(231,177,70,.12)';ctx.lineWidth=3;ctx.setLineDash([9,7]);ctx.beginPath();ctx.ellipse(p.x,y,d.radius,d.radius*.55,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.setLineDash([]);
      }
      ctx.restore();
    }
    const p=units.filter(u=>u.side==='player'&&!u.dead).sort((a,b)=>b.x-a.x)[0];
    const e=units.filter(u=>u.side==='enemy'&&!u.dead).sort((a,b)=>a.x-b.x)[0];
    if(p&&e){const x=(p.x+e.x)/2;ctx.save();ctx.globalAlpha=.11;ctx.strokeStyle='#efe0aa';ctx.lineWidth=1;ctx.setLineDash([4,8]);ctx.beginPath();ctx.moveTo(x,330);ctx.lineTo(x,820);ctx.stroke();ctx.restore();}
  }

  function depthScale(y){return .72+((y-CONFIG.laneMinY)/(CONFIG.laneMaxY-CONFIG.laneMinY))*.42;}

  function drawGhostUnit(x,y,d){
    if(d.vehicle){ctx.save();ctx.translate(x,y);ctx.globalAlpha=.7;ctx.strokeStyle='#d8efb6';ctx.lineWidth=3;ctx.strokeRect(-38,-42,76,38);ctx.beginPath();ctx.ellipse(0,0,42,13,0,0,Math.PI*2);ctx.stroke();ctx.restore();return;}
    const s=depthScale(y);ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='rgba(171,216,126,.25)';ctx.beginPath();ctx.ellipse(0,0,30,12,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(216,238,185,.85)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-34,17,0,Math.PI*2);ctx.stroke();ctx.strokeRect(-16,-18,32,36);ctx.restore();
  }

  function drawGhostStructure(x,y,typeId,valid){
    const s=depthScale(y),d=STRUCT_TYPES[typeId];ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha=.75;ctx.strokeStyle=valid?'#d8efb6':'#ef795f';ctx.lineWidth=4;ctx.strokeRect(-d.radius,-d.radius*1.25,d.radius*2,d.radius*1.25);ctx.beginPath();ctx.ellipse(0,2,d.radius*1.15,d.radius*.35,0,0,Math.PI*2);ctx.stroke();ctx.restore();
  }

  function teamColors(u){return u.side==='player'?{body:'#6f8052',helmet:'#52633d',accent:'#c4b66d',dark:'#242b24'}:{body:'#7b4135',helmet:'#563127',accent:'#c98a55',dark:'#28201d'};}

  function drawUnit(u){
    if(u.def.vehicle){drawVehicle(u);return;}
    const s=depthScale(u.y)*(u.typeId==='heavy'?1.12:1),c=teamColors(u),alpha=u.dead?Math.max(0,1-u.deathT/.8):1,fall=u.dead?Math.min(1,u.deathT/.32):0,walk=Math.sin(u.walkT*5)*(u.dead?0:2.5);
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(u.x,u.y);ctx.scale(s*u.facing,s);ctx.rotate(fall*.92*-u.facing);
    ctx.save();ctx.scale(u.facing,1);ctx.fillStyle='rgba(0,0,0,.24)';ctx.beginPath();ctx.ellipse(0,2,30,10,0,0,Math.PI*2);ctx.fill();ctx.restore();
    ctx.strokeStyle='#2f342b';ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-7,-7);ctx.lineTo(-10+walk,-1);ctx.moveTo(7,-7);ctx.lineTo(10-walk,-1);ctx.stroke();
    ctx.fillStyle=u.hitFlash>0?'#d7d0b9':c.body;roundedRect(ctx,-20,-43,40,38,9);ctx.fill();
    ctx.fillStyle=c.dark;ctx.globalAlpha*=.7;ctx.fillRect(-16,-35,32,18);ctx.globalAlpha=alpha;
    ctx.fillStyle='#b7a98c';ctx.beginPath();ctx.arc(0,-58,15,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=c.helmet;ctx.beginPath();ctx.arc(0,-62,17,Math.PI,Math.PI*2);ctx.lineTo(17,-59);ctx.lineTo(-17,-59);ctx.fill();ctx.fillRect(-17,-61,34,5);
    ctx.strokeStyle='#9d8e74';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(10,-33);ctx.lineTo(21,-28);ctx.stroke();drawWeapon(u,c);ctx.fillStyle=c.accent;ctx.fillRect(-17,-34,5,7);
    if(u.muzzleFlash>0&&u.def.range>70){ctx.fillStyle='rgba(255,224,128,.95)';ctx.beginPath();ctx.moveTo(48,-31);ctx.lineTo(62,-36);ctx.lineTo(56,-29);ctx.lineTo(64,-24);ctx.lineTo(48,-27);ctx.fill();}
    if(u.freezeTimer>0){ctx.fillStyle='rgba(135,213,255,.28)';ctx.beginPath();ctx.arc(0,-28,35,0,Math.PI*2);ctx.fill();}
    if(u.speedBoostTimer>0){ctx.strokeStyle='rgba(187,240,128,.7)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-38,-18);ctx.lineTo(-55,-18);ctx.moveTo(-34,-30);ctx.lineTo(-49,-30);ctx.stroke();}
    ctx.restore();drawHpBar(u,s,48,88);
  }

  function drawWeapon(u,c){
    ctx.save();
    if(u.typeId==='assault'){ctx.strokeStyle='#d1cab0';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(19,-31);ctx.lineTo(47,-48);ctx.stroke();ctx.strokeStyle='#4a4031';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(15,-28);ctx.lineTo(29,-36);ctx.stroke();}
    else if(u.typeId==='heavy'){ctx.fillStyle='#454d41';ctx.strokeStyle='#8a9276';ctx.lineWidth=3;roundedRect(ctx,17,-48,29,35,5);ctx.fill();ctx.stroke();ctx.fillStyle=c.accent;ctx.fillRect(27,-39,8,8);}
    else if(u.typeId==='shield'){ctx.fillStyle='#666b58';ctx.strokeStyle='#b9b996';ctx.lineWidth=3;roundedRect(ctx,12,-49,22,41,5);ctx.fill();ctx.stroke();ctx.strokeStyle='#d2cbb0';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(22,-28);ctx.lineTo(44,-43);ctx.stroke();}
    else if(u.typeId==='rocket'){ctx.fillStyle='#30352d';ctx.fillRect(15,-37,43,9);ctx.fillStyle='#5f694e';ctx.fillRect(21,-41,21,17);}
    else {const long=u.typeId==='sniper'?60:u.typeId==='gunner'?52:46;ctx.strokeStyle='#282b25';ctx.lineWidth=u.typeId==='gunner'?7:5;ctx.beginPath();ctx.moveTo(17,-30);ctx.lineTo(long,-30);ctx.stroke();ctx.strokeStyle='#554a36';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(24,-29);ctx.lineTo(35,-20);ctx.stroke();if(u.typeId==='gunner'){ctx.strokeStyle='#282b25';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(35,-27);ctx.lineTo(39,-16);ctx.moveTo(41,-27);ctx.lineTo(47,-17);ctx.stroke();}}
    ctx.restore();
  }

  function drawVehicle(u){
    const s=depthScale(u.y)*(u.def.vehicle==='tank'?1.13:u.def.vehicle==='apc'?1.05:.95),c=teamColors(u),alpha=u.dead?Math.max(0,1-u.deathT/.8):1;
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(u.x,u.y);ctx.scale(s*u.facing,s);
    ctx.fillStyle='rgba(0,0,0,.26)';ctx.beginPath();ctx.ellipse(0,2,51,14,0,0,Math.PI*2);ctx.fill();
    const body=u.hitFlash>0?'#d7d0b9':c.body;
    if(u.def.vehicle==='jeep'){
      ctx.fillStyle='#252922';for(const x of [-29,27]){ctx.beginPath();ctx.arc(x,-4,12,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle=body;roundedRect(ctx,-38,-34,75,29,7);ctx.fill();ctx.fillStyle=c.dark;ctx.fillRect(-10,-48,28,18);ctx.strokeStyle='#282b25';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(10,-48);ctx.lineTo(47,-48);ctx.stroke();
    } else if(u.def.vehicle==='apc'){
      ctx.fillStyle='#262a24';for(const x of [-32,-12,10,31]){ctx.beginPath();ctx.arc(x,-3,10,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle=body;roundedRect(ctx,-48,-43,96,39,7);ctx.fill();ctx.fillStyle=c.dark;ctx.fillRect(-24,-55,48,17);ctx.strokeStyle='#242822';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(8,-55);ctx.lineTo(47,-55);ctx.stroke();
    } else {
      ctx.fillStyle='#242822';ctx.fillRect(-50,-10,100,10);ctx.fillStyle=body;roundedRect(ctx,-48,-46,96,37,8);ctx.fill();ctx.fillStyle=c.dark;ctx.beginPath();ctx.ellipse(2,-49,28,20,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#242822';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(12,-50);ctx.lineTo(70,-50);ctx.stroke();
    }
    ctx.fillStyle=c.accent;ctx.fillRect(-38,-33,8,8);
    if(u.muzzleFlash>0){ctx.fillStyle='rgba(255,220,120,.95)';ctx.beginPath();ctx.moveTo(50,-50);ctx.lineTo(68,-57);ctx.lineTo(61,-49);ctx.lineTo(69,-41);ctx.lineTo(50,-46);ctx.fill();}
    if(u.freezeTimer>0){ctx.fillStyle='rgba(135,213,255,.25)';ctx.fillRect(-55,-65,110,60);}
    ctx.restore();drawHpBar(u,s,u.def.vehicle==='tank'?82:70,82);
  }

  function drawStructure(s){
    const sc=depthScale(s.y),alpha=s.dead?Math.max(0,1-s.deathT/1.1):1;
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(s.x,s.y);ctx.scale(sc,sc);
    ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,3,s.def.radius*1.15,s.def.radius*.35,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=s.hitFlash>0?'#d9d3bd':'#59644a';ctx.strokeStyle='#2c3329';ctx.lineWidth=4;
    if(s.typeId==='turret'){
      roundedRect(ctx,-31,-34,62,30,6);ctx.fill();ctx.stroke();ctx.fillStyle='#384034';ctx.beginPath();ctx.arc(0,-39,19,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#252a23';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(8,-42);ctx.lineTo(52,-42);ctx.stroke();if(s.muzzleFlash>0){ctx.fillStyle='#ffd879';ctx.beginPath();ctx.moveTo(49,-42);ctx.lineTo(68,-49);ctx.lineTo(59,-41);ctx.lineTo(68,-33);ctx.closePath();ctx.fill();}
    } else if(s.typeId==='generator'){
      roundedRect(ctx,-34,-45,68,41,5);ctx.fill();ctx.stroke();ctx.fillStyle='#2d352b';ctx.fillRect(-22,-55,10,12);ctx.fillRect(12,-55,10,12);ctx.strokeStyle='#dbb54d';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-26,12,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#e6c766';ctx.fillRect(-3,-33,6,14);
    } else {
      roundedRect(ctx,-42,-48,84,44,6);ctx.fill();ctx.stroke();ctx.fillStyle='#30372e';ctx.beginPath();ctx.moveTo(-46,-48);ctx.lineTo(0,-72);ctx.lineTo(46,-48);ctx.closePath();ctx.fill();ctx.fillStyle='#252a24';ctx.fillRect(-12,-31,24,27);ctx.fillStyle='#c5b365';ctx.fillRect(24,-42,8,8);
    }
    ctx.restore();drawHpBar(s,sc,s.def.radius*2,79);
  }

  function drawHpBar(e,s,widthBase,yOffset){
    if(e.dead||e.hp>=e.maxHp)return;const width=widthBase*s,h=5,x=e.x-width/2,y=e.y-yOffset*s;ctx.fillStyle='rgba(0,0,0,.48)';ctx.fillRect(x,y,width,h);ctx.fillStyle=e.side==='player'?'#89b862':'#c95d4a';ctx.fillRect(x,y,width*Math.max(0,e.hp/e.maxHp),h);
  }

  function drawMines(){
    for(const m of mines){const s=depthScale(m.y);ctx.save();ctx.translate(m.x,m.y);ctx.scale(s,s);ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,1,16,6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3b4634';ctx.strokeStyle='#1e241d';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-4,11,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=m.armed>0?'#b8aa64':'#d15642';ctx.beginPath();ctx.arc(0,-6,3,0,Math.PI*2);ctx.fill();ctx.restore();}
  }

  function drawAreaFx(){
    ctx.save();
    for(const a of areaFx){const t=a.life/a.max;ctx.globalAlpha=Math.max(0,t);
      if(a.kind==='bomb'||a.kind==='blast'){ctx.fillStyle='rgba(255,176,64,.20)';ctx.strokeStyle='rgba(255,213,118,.75)';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(a.x,a.y,a.r*(1.15-t*.15),a.r*.55*(1.15-t*.15),0,0,Math.PI*2);ctx.fill();ctx.stroke();}
      else if(a.kind==='freeze'){ctx.fillStyle='rgba(105,194,244,.18)';ctx.strokeStyle='rgba(164,225,255,.8)';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(a.x,a.y,a.r,a.r*.55,0,0,Math.PI*2);ctx.fill();ctx.stroke();}
      else if(a.kind==='rush'){ctx.fillStyle='rgba(146,219,92,.14)';ctx.strokeStyle='rgba(191,241,143,.8)';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(a.x,a.y,a.r,a.r*.55,0,0,Math.PI*2);ctx.fill();ctx.stroke();}
      else {ctx.strokeStyle='rgba(218,211,132,.75)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(a.x,a.y,a.r*(1.2-t*.2),0,Math.PI*2);ctx.stroke();}
    }
    ctx.restore();
  }

  function roundedRect(context,x,y,w,h,r){const rr=Math.min(r,w/2,h/2);context.beginPath();context.moveTo(x+rr,y);context.arcTo(x+w,y,x+w,y+h,rr);context.arcTo(x+w,y+h,x,y+h,rr);context.arcTo(x,y+h,x,y,rr);context.arcTo(x,y,x+w,y,rr);context.closePath();}

  function drawTracers(){ctx.save();ctx.lineCap='round';for(const t of tracers){const a=t.life/t.max;ctx.globalAlpha=a;ctx.strokeStyle=t.heavy?'#ffe29a':'#f3d6a0';ctx.lineWidth=t.heavy?3:2;ctx.beginPath();ctx.moveTo(t.x1,t.y1);ctx.lineTo(t.x2,t.y2);ctx.stroke();}ctx.restore();}
  function drawParticles(){ctx.save();for(const p of particles){const a=Math.max(0,p.life/p.max);ctx.globalAlpha=a;if(p.kind==='spark'){ctx.fillStyle='#f1c568';ctx.fillRect(p.x,p.y,p.size,p.size);}else{ctx.fillStyle='rgba(91,76,49,.55)';ctx.beginPath();ctx.arc(p.x,p.y,p.size*(1-a*.55),0,Math.PI*2);ctx.fill();}}ctx.restore();}
  function drawBaseDamage(){if(!game)return;if(game.flashPlayerBase>0){ctx.fillStyle=`rgba(255,89,52,${game.flashPlayerBase*.16})`;ctx.fillRect(0,250,290,360);}if(game.flashEnemyBase>0){ctx.fillStyle=`rgba(255,89,52,${game.flashEnemyBase*.16})`;ctx.fillRect(1245,240,291,390);}}
  function flashMessage(text){game.message=text;game.messageTimer=1.25;}
  function drawMessage(){if(!game||game.messageTimer<=0)return;ctx.save();ctx.font='900 24px system-ui';ctx.textAlign='center';const w=ctx.measureText(game.message).width+36;ctx.fillStyle='rgba(10,14,12,.75)';ctx.fillRect(W/2-w/2,178,w,45);ctx.fillStyle='#f3e2b2';ctx.fillText(game.message,W/2,208);ctx.restore();}

  // ---------------------------------------------------------------------------
  // HUD / END STATE
  // ---------------------------------------------------------------------------
  function updateHUD(){
    if(!game)return;
    ui.playerHpFill.style.width=`${Math.max(0,game.playerHp/CONFIG.baseHp)*100}%`;ui.enemyHpFill.style.width=`${Math.max(0,game.enemyHp/CONFIG.baseHp)*100}%`;
    ui.playerHpText.textContent=`${Math.ceil(game.playerHp)} / ${CONFIG.baseHp}`;ui.enemyHpText.textContent=`${Math.ceil(game.enemyHp)} / ${CONFIG.baseHp}`;
    ui.energyText.textContent=game.playerEnergy.toFixed(1);ui.energyFill.style.width=`${game.playerEnergy/CONFIG.maxEnergy*100}%`;
    const regen=energyRegen();ui.regen.textContent=`+${regen.toFixed(2)}/s`;
    const sec=Math.ceil(game.remaining),m=Math.floor(sec/60),s=sec%60;ui.timer.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    ui.phase.textContent=game.elapsed<30?'DEPLOYMENT':game.elapsed<120?'FRONTLINE':game.elapsed<180?'ESCALATION ×2':'FINAL PUSH ×3';
    updateCardAvailability();updateDeckStatus();
  }

  function finish(victory,subtitle){
    if(!game.running)return;game.running=false;ui.resultKicker.textContent='BATTLE COMPLETE';ui.resultTitle.textContent=victory?'VICTORY':'DEFEAT';ui.resultTitle.style.color=victory?'#d9c16a':'#ca6a59';ui.resultSubtitle.textContent=subtitle;ui.statDamage.textContent=Math.round(game.stats.damage).toLocaleString();ui.statUnits.textContent=game.stats.units;ui.statEnergy.textContent=Math.round(game.stats.energy);ui.result.classList.remove('hidden');updateCardAvailability();
  }

  function togglePause(){if(!game.running)return;game.paused=!game.paused;ui.pause.textContent=game.paused?'▶':'Ⅱ';ui.pauseScreen.classList.toggle('hidden',!game.paused);updateCardAvailability();}

  ui.restart.addEventListener('click',()=>{resetGame();lastTime=performance.now();});
  ui.pause.addEventListener('click',togglePause);
  ui.sound.addEventListener('click',()=>{muted=!muted;ui.sound.textContent=muted?'🔇':'🔊';if(!muted)ensureAudio();});
  window.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();togglePause();}});

  function loop(now){const dt=Math.min(.033,(now-lastTime)/1000||0);lastTime=now;if(game&&!game.paused)update(dt);draw();requestAnimationFrame(loop);}

  resetGame();requestAnimationFrame(loop);
})();
