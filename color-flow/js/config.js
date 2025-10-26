(function(global){
  'use strict';
  // Configuration constants for Color Flow. Tunable difficulty documented in README.
  // Required constants
  const COLOR_PALETTE = ["#FF4D4D","#4DA6FF","#4DFF88","#FFD24D"]; // red, blue, green, yellow
  const SPAWN_INTERVAL_START = 900; // ms
  const SPAWN_INTERVAL_MIN = 250;   // ms
  const BLOCK_SPEED_START = 200;    // px/s
  const BLOCK_SPEED_MAX = 800;      // px/s
  const DIFFICULTY_STEP_SECONDS = 10; // step period in seconds
  const BASE_POINTS = 10;
  const MULTIPLIER_CAP = 5;
  const PARTICLE_DURATION_MS = 400;
  const CATCH_SFX_MAX_DURATION_MS = 300;

  // Additional tuning (documented in README)
  const DIFFICULTY_MODE = 'linear'; // 'linear' | 'exp'
  const DIFFICULTY_LINEAR_STEPS_TO_MAX = 20; // After 20 steps (200s), reach max difficulty
  const DIFFICULTY_EXPONENT = 1.6; // Only used when DIFFICULTY_MODE === 'exp'

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

  // Returns multiplier as specified: min(5, 1 + Math.floor(streak / 3) * 0.5)
  function computeMultiplier(streak){
    const mult = 1 + Math.floor(streak / 3) * 0.5;
    return Math.min(MULTIPLIER_CAP, mult);
  }

  // pointsForCatch = round(BASE_POINTS * multiplier * (1 + min(streak, 100)/100))
  function computePointsForCatch(streak, basePoints = BASE_POINTS){
    const mult = computeMultiplier(streak);
    const term = 1 + Math.min(streak, 100)/100;
    return Math.round(basePoints * mult * term);
  }

  // Difficulty progression helpers (time-based, steps every DIFFICULTY_STEP_SECONDS)
  function computeDifficultyProgress(elapsedSeconds){
    const steps = Math.floor(elapsedSeconds / DIFFICULTY_STEP_SECONDS);
    const pLinear = clamp(steps / DIFFICULTY_LINEAR_STEPS_TO_MAX, 0, 1);
    if (DIFFICULTY_MODE === 'exp') {
      return Math.pow(pLinear, DIFFICULTY_EXPONENT);
    }
    return pLinear; // default linear
  }

  function computeSpawnIntervalMs(elapsedSeconds){
    const p = computeDifficultyProgress(elapsedSeconds);
    const val = SPAWN_INTERVAL_START - p * (SPAWN_INTERVAL_START - SPAWN_INTERVAL_MIN);
    return Math.max(SPAWN_INTERVAL_MIN, Math.round(val));
  }

  function computeBlockSpeed(elapsedSeconds){
    const p = computeDifficultyProgress(elapsedSeconds);
    const val = BLOCK_SPEED_START + p * (BLOCK_SPEED_MAX - BLOCK_SPEED_START);
    return Math.min(BLOCK_SPEED_MAX, val);
  }

  const CONFIG = {
    COLOR_PALETTE,
    SPAWN_INTERVAL_START,
    SPAWN_INTERVAL_MIN,
    BLOCK_SPEED_START,
    BLOCK_SPEED_MAX,
    DIFFICULTY_STEP_SECONDS,
    BASE_POINTS,
    MULTIPLIER_CAP,
    PARTICLE_DURATION_MS,
    CATCH_SFX_MAX_DURATION_MS,
    DIFFICULTY_MODE,
    DIFFICULTY_LINEAR_STEPS_TO_MAX,
    DIFFICULTY_EXPONENT,
    computeMultiplier,
    computePointsForCatch,
    computeDifficultyProgress,
    computeSpawnIntervalMs,
    computeBlockSpeed,
  };

  // UMD-style export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG };
  } else {
    global.GameConfig = CONFIG;
  }
})(typeof window !== 'undefined' ? window : globalThis);
