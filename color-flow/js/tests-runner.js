(function(){
  'use strict';
  function log(msg){ console.log(msg); const pre = document.getElementById('test-log'); if (pre) pre.textContent += msg + "\n"; }

  async function run(){
    const mod = (typeof require !== 'undefined') ? require : null;
    const tests = [];
    try { tests.push(require('../tests/test_scoring.js')); } catch(e){}
    try { tests.push(require('../tests/test_multiplier.js')); } catch(e){}
    try { tests.push(require('../tests/test_spawn_logic.js')); } catch(e){}

    // Browser fallback
    if (!tests.length && window.test_scoring) {
      tests.push(window.test_scoring);
      tests.push(window.test_multiplier);
      tests.push(window.test_spawn_logic);
    }

    for (const t of tests){
      const out = t.run();
      log(out);
    }
    log('All tests executed.');
  }

  if (typeof window === 'undefined'){
    // Node usage
    run();
  } else {
    window.addEventListener('DOMContentLoaded', run);
  }
})();
