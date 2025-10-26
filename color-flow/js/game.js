// ES module; accesses global window.GameConfig, window.UILayer, window.AudioAPI, window.StorageAPI
export default function createGame({ canvas }){
  const CFG = window.GameConfig;
  const UI = window.UILayer;
  const Audio = window.AudioAPI;
  const Store = window.StorageAPI;

  const ctx = canvas.getContext('2d', { alpha: false });
  const width = canvas.width; // 960
  const height = canvas.height; // 640

  // Layout
  const laneY = height * 0.6; // single lane Y
  const collectorLineX = width * 0.18; // where collision check happens
  const collectorSize = 72; // visual size
  const blockSize = 56; // size of incoming blocks

  // State
  let running = true;
  let gameOver = false;
  let colorIndex = 0;
  let score = 0;
  let streak = 0;
  let best = Store.getBestScore();
  let elapsed = 0; // seconds since start
  let spawnTimer = 0;
  let spawnInterval = CFG.SPAWN_INTERVAL_START; // ms
  let blockSpeed = CFG.BLOCK_SPEED_START; // px/s
  let colorBlind = Store.getColorBlindEnabled();
  let vibrationEnabled = Store.getVibrationEnabled();

  // Patterns for colorblind mode
  const patterns = createPatterns(ctx);

  // Object pool for blocks
  const pool = [];
  const active = [];
  const maxBlocks = 64;
  for (let i=0;i<maxBlocks;i++) pool.push(createBlock());

  // Particles and score pops
  const particles = [];
  const scorePops = [];

  function createBlock(){
    return { active: false, colorIndex: 0, x: width + 100, y: laneY - blockSize/2, size: blockSize, crossed: false };
  }
  function spawnBlock(){
    const b = pool.length ? pool.pop() : createBlock();
    b.active = true;
    b.colorIndex = Math.floor(Math.random()*CFG.COLOR_PALETTE.length);
    b.x = width + 20;
    b.y = laneY - blockSize/2;
    b.size = blockSize;
    b.crossed = false;
    active.push(b);
  }

  function recycleBlock(i){
    const b = active[i];
    active.splice(i,1);
    b.active = false; pool.push(b);
  }

  function drawCollector(){
    const x = collectorLineX - collectorSize/2;
    const y = laneY - collectorSize/2;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0c0c18';
    if (colorBlind){
      ctx.fillStyle = ctx.createPattern(patterns[colorIndex], 'repeat');
    } else {
      ctx.fillStyle = CFG.COLOR_PALETTE[colorIndex];
    }
    roundRect(ctx, x, y, collectorSize, collectorSize, 10, true, true);
  }

  function drawBlock(b){
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0c0c18';
    if (colorBlind){
      ctx.fillStyle = ctx.createPattern(patterns[b.colorIndex], 'repeat');
    } else {
      ctx.fillStyle = CFG.COLOR_PALETTE[b.colorIndex];
    }
    roundRect(ctx, b.x, b.y, b.size, b.size, 6, true, true);
  }

  function update(dt){
    if (!running || gameOver) return;
    elapsed += dt;

    // Difficulty progression
    spawnInterval = CFG.computeSpawnIntervalMs(elapsed);
    blockSpeed = CFG.computeBlockSpeed(elapsed);

    // Spawn logic
    spawnTimer += dt*1000;
    if (spawnTimer >= spawnInterval){
      spawnTimer -= spawnInterval;
      spawnBlock();
    }

    // Update blocks
    for (let i=active.length-1;i>=0;i--){
      const b = active[i];
      const prevX = b.x;
      b.x -= blockSpeed * dt;

      // Check crossing collector line
      if (!b.crossed && prevX + b.size/2 > collectorLineX && b.x + b.size/2 <= collectorLineX){
        b.crossed = true;
        const matched = (b.colorIndex === colorIndex);
        if (matched){
          // Catch
          streak += 1;
          const mult = CFG.computeMultiplier(streak);
          const points = CFG.computePointsForCatch(streak);
          score += points;
          if (streak % 3 === 0) {
            Audio?.playMultiplierUp();
            spawnBurst(b.x + b.size/2, b.y + b.size/2, 30);
          } else {
            Audio?.playCatch();
            spawnBurst(b.x + b.size/2, b.y + b.size/2, 16);
          }
          spawnScorePop('+'+points, b.x + b.size/2, b.y + b.size/2);
          if (vibrationEnabled && navigator.vibrate) try{ navigator.vibrate(10); }catch(e){}
          recycleBlock(i);
        } else {
          // Miss → game over
          handleGameOver();
          recycleBlock(i);
        }
      }

      // Off-screen
      if (b.x + b.size < -20){
        recycleBlock(i);
      }
    }

    UI?.updateHUD(score, CFG.computeMultiplier(streak), Math.max(best, score));
  }

  function render(){
    // Clear
    ctx.fillStyle = '#0b0f1d';
    ctx.fillRect(0,0,width,height);

    // Lane line and collector
    ctx.strokeStyle = '#1d2544';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, laneY + blockSize/2 + 20);
    ctx.lineTo(width, laneY + blockSize/2 + 20);
    ctx.stroke();

    drawCollector();

    // Blocks
    for (let i=0;i<active.length;i++) drawBlock(active[i]);

    // Particles
    drawParticles();
    drawScorePops();
  }

  function loop(ts){
    if (!loop.last) loop.last = ts;
    const dt = Math.min(0.05, (ts - loop.last)/1000);
    loop.last = ts;

    if (running && !gameOver) update(dt);
    render();

    requestAnimationFrame(loop);
  }

  // Inputs
  function cycleColor(){
    colorIndex = (colorIndex + 1) % CFG.COLOR_PALETTE.length;
  }
  canvas.addEventListener('pointerdown', () => { if (!gameOver) cycleColor(); });
  window.addEventListener('keydown', (e) => { if (e.code === 'Space'){ e.preventDefault(); if (!gameOver) cycleColor(); }});

  // Toggle handlers
  window.addEventListener('cf:colorblind-changed', (e) => {
    colorBlind = !!e.detail?.enabled;
  });

  // PostMessage integration: set mode
  window.addEventListener('message', (e) => {
    const data = e?.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === 'SET_MODE'){
      colorBlind = data.mode === 'pattern';
    }
  });

  function spawnBurst(cx, cy, count){
    for (let i=0;i<count;i++){
      const angle = Math.random()*Math.PI*2;
      const speed = 80 + Math.random()*160;
      const life = (window.GameConfig?.PARTICLE_DURATION_MS || 400)/1000;
      particles.push({ x: cx, y: cy, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life, age:0 });
    }
  }
  function drawParticles(){
    for (let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.age += 1/60; // approximate, visual only
      p.x += p.vx/60; p.y += p.vy/60;
      const t = 1 - p.age/p.life;
      if (t <= 0){ particles.splice(i,1); continue; }
      ctx.globalAlpha = Math.max(0, t);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.x, p.y, 2, 2);
      ctx.globalAlpha = 1;
    }
  }

  function spawnScorePop(text, x, y){
    scorePops.push({ text, x, y, age:0, life:0.6 });
  }
  function drawScorePops(){
    ctx.save();
    ctx.font = '16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (let i=scorePops.length-1;i>=0;i--){
      const s = scorePops[i];
      s.age += 1/60;
      const t = 1 - s.age/s.life;
      if (t <= 0){ scorePops.splice(i,1); continue; }
      ctx.globalAlpha = Math.max(0, t);
      ctx.fillStyle = '#e9ecf1';
      ctx.fillText(s.text, s.x, s.y - s.age*30);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function handleGameOver(){
    if (gameOver) return;
    gameOver = true; running = false;
    Audio?.playGameOver();
    best = Store.setBestScore(score);
    UI?.showOverlay(score, best);
  }

  function restart(){
    // Reset state
    running = true; gameOver = false; score = 0; streak = 0; elapsed = 0; spawnTimer = 0;
    spawnInterval = CFG.SPAWN_INTERVAL_START; blockSpeed = CFG.BLOCK_SPEED_START;
    colorIndex = 0; particles.length = 0; scorePops.length = 0;
    // recycle all blocks
    while(active.length){ const b = active.pop(); b.active = false; pool.push(b); }
  }

  function togglePause(){ running = !running; return !running; }

  // Initial HUD
  UI?.updateHUD(score, CFG.computeMultiplier(streak), Math.max(best, score));

  // Start loop
  requestAnimationFrame(loop);

  return { restart, togglePause };
}

function roundRect(ctx, x, y, w, h, r, fill, stroke){
  if (typeof r === 'number') r = { tl:r, tr:r, br:r, bl:r };
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function createPatterns(ctx){
  const arr = [];
  const make = (drawer) => {
    const c = document.createElement('canvas'); c.width = 16; c.height = 16;
    const g = c.getContext('2d');
    g.fillStyle = '#1a1e33'; g.fillRect(0,0,16,16);
    drawer(g);
    return c;
  };
  // stripes
  arr.push(make((g)=>{ g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(0,16); g.lineTo(16,0); g.stroke(); g.beginPath(); g.moveTo(-8,16); g.lineTo(8,0); g.stroke(); }));
  // dots
  arr.push(make((g)=>{ g.fillStyle = '#fff'; for(let y=2;y<16;y+=6){ for(let x=2;x<16;x+=6){ g.fillRect(x,y,2,2);} } }));
  // triangles
  arr.push(make((g)=>{ g.fillStyle = '#fff'; g.beginPath(); g.moveTo(8,2); g.lineTo(14,14); g.lineTo(2,14); g.closePath(); g.fill(); }));
  // grid
  arr.push(make((g)=>{ g.strokeStyle = '#fff'; g.lineWidth=1; for(let i=0;i<=16;i+=4){ g.beginPath(); g.moveTo(i,0); g.lineTo(i,16); g.stroke(); g.beginPath(); g.moveTo(0,i); g.lineTo(16,i); g.stroke(); } }));
  return arr;
}
