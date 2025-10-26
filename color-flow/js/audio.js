(function(global){
  'use strict';
  // Audio uses WebAudio oscillator-based beeps by default to avoid decode issues.
  // Placeholder asset files exist in /assets but are not required at runtime.
  const ctx = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext))
    ? new (window.AudioContext || window.webkitAudioContext)()
    : null;

  let enabled = true;

  function setEnabled(v){ enabled = !!v; }
  function resume(){ if (ctx && ctx.state === 'suspended') ctx.resume(); }

  function beep(freq, durationMs, type){
    if (!enabled || !ctx) return;
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(0.001, now);
    g.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + durationMs/1000);
    o.connect(g); g.connect(ctx.destination);
    o.start(now);
    o.stop(now + durationMs/1000 + 0.01);
  }

  // Specific SFX
  function playCatch(){ resume(); beep(660, Math.min(250, (global.GameConfig?.CATCH_SFX_MAX_DURATION_MS)||250), 'triangle'); }
  function playCombo(){ resume(); beep(800, 160, 'square'); }
  function playMultiplierUp(){ resume(); beep(1000, 220, 'sawtooth'); }
  function playGameOver(){ resume(); beep(180, 300, 'sine'); }

  const api = { setEnabled, playCatch, playCombo, playMultiplierUp, playGameOver };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.AudioAPI = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
