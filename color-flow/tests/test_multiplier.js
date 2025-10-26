/* global require, module */
const { CONFIG } = (typeof require !== 'undefined') ? require('../js/config.js') : { CONFIG: window.GameConfig };

function assertEq(actual, expected, msg){ if (actual !== expected) throw new Error(msg+` (got ${actual}, expected ${expected})`); }

function run(){
  const cm = CONFIG.computeMultiplier;
  const cap = CONFIG.MULTIPLIER_CAP;
  const seq = [0,1,2,3,4,5,6,7,8,9,30];
  seq.forEach(s => {
    const m = cm(s);
    if (s >= 30) { // rough range where cap might be hit
      if (m > cap) throw new Error('cap exceeded');
    }
  });
  // explicit checks
  assertEq(cm(0), 1, 'm streak 0');
  assertEq(cm(2), 1, 'm streak 2');
  assertEq(cm(3), 1.5, 'm streak 3');
  assertEq(cm(6), 2.0, 'm streak 6');
  assertEq(cm(9), 2.5, 'm streak 9');
  // verify cap
  const big = cm(999);
  if (big > cap) throw new Error('cap not enforced');
  return 'test_multiplier OK';
}

if (typeof module !== 'undefined' && module.exports){ module.exports = { run }; } else { window.test_multiplier = { run }; }
