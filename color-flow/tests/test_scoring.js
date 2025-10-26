/* global require, module */
const { CONFIG } = (typeof require !== 'undefined') ? require('../js/config.js') : { CONFIG: window.GameConfig };

function assertEq(actual, expected, msg){
  if (actual !== expected) throw new Error(msg+` (got ${actual}, expected ${expected})`);
}

function run(){
  const c = CONFIG;
  // Test several streak values
  const cases = [
    { streak: 0, expected: Math.round(c.BASE_POINTS * c.computeMultiplier(0) * (1 + 0/100)) },
    { streak: 1, expected: Math.round(c.BASE_POINTS * c.computeMultiplier(1) * (1 + 1/100)) },
    { streak: 3, expected: Math.round(c.BASE_POINTS * c.computeMultiplier(3) * (1 + 3/100)) },
    { streak: 10, expected: Math.round(c.BASE_POINTS * c.computeMultiplier(10) * (1 + 10/100)) },
    { streak: 100, expected: Math.round(c.BASE_POINTS * c.computeMultiplier(100) * (1 + 100/100)) },
  ];

  cases.forEach(({ streak, expected }) => {
    const got = c.computePointsForCatch(streak, c.BASE_POINTS);
    assertEq(got, expected, `pointsForCatch mismatch for streak=${streak}`);
  });

  return 'test_scoring OK';
}

if (typeof module !== 'undefined' && module.exports){ module.exports = { run }; } else { window.test_scoring = { run }; }
