/* global require, module */
const { CONFIG } = (typeof require !== 'undefined') ? require('../js/config.js') : { CONFIG: window.GameConfig };

function assert(cond, msg){ if (!cond) throw new Error(msg); }

function run(){
  const start = CONFIG.SPAWN_INTERVAL_START;
  const min = CONFIG.SPAWN_INTERVAL_MIN;
  const step = CONFIG.DIFFICULTY_STEP_SECONDS;

  const t0 = 0;
  const t1 = step * 5; // some steps later
  const tEnd = step * CONFIG.DIFFICULTY_LINEAR_STEPS_TO_MAX;

  const s0 = CONFIG.computeSpawnIntervalMs(t0);
  const s1 = CONFIG.computeSpawnIntervalMs(t1);
  const sEnd = CONFIG.computeSpawnIntervalMs(tEnd + step*5);

  assert(s0 === start, 'spawn at t0 should be start');
  assert(s1 < s0, 'spawn should reduce over time');
  assert(sEnd === min, 'spawn should reach min and clamp');

  // Speed progression
  const v0 = CONFIG.computeBlockSpeed(t0);
  const v1 = CONFIG.computeBlockSpeed(t1);
  const vEnd = CONFIG.computeBlockSpeed(tEnd + step*5);
  assert(v0 === CONFIG.BLOCK_SPEED_START, 'speed at t0 should be start');
  assert(v1 > v0, 'speed should increase');
  assert(vEnd === CONFIG.BLOCK_SPEED_MAX, 'speed should clamp at max');

  return 'test_spawn_logic OK';
}

if (typeof module !== 'undefined' && module.exports){ module.exports = { run }; } else { window.test_spawn_logic = { run }; }
