(function(global){
  'use strict';
  const KEY_BEST = 'colorflow_best';
  const KEY_SOUND = 'colorflow_sound';
  const KEY_VIBRATION = 'colorflow_vibration';
  const KEY_COLORBLIND = 'colorflow_colorblind';

  function hasLocalStorage(){
    try {
      const k = '__cf_test__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch(e){
      return false;
    }
  }

  const memoryStore = {};
  function getStore(){
    return hasLocalStorage() ? window.localStorage : {
      getItem: (k) => memoryStore[k] ?? null,
      setItem: (k,v) => { memoryStore[k] = String(v); },
      removeItem: (k) => { delete memoryStore[k]; },
    };
  }

  function getBestScore(){
    const s = getStore().getItem(KEY_BEST);
    const n = s ? parseInt(s, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  }
  function setBestScore(score){
    const best = Math.max(0, Math.floor(score||0));
    const prev = getBestScore();
    if (best > prev) {
      getStore().setItem(KEY_BEST, String(best));
      return best;
    }
    return prev;
  }

  function getToggle(key, def){
    const v = getStore().getItem(key);
    if (v === null) return def;
    return v === '1';
  }
  function setToggle(key, val){
    getStore().setItem(key, val ? '1' : '0');
  }

  const api = {
    getBestScore,
    setBestScore,
    getSoundEnabled: () => getToggle(KEY_SOUND, true),
    setSoundEnabled: (v) => setToggle(KEY_SOUND, !!v),
    getVibrationEnabled: () => getToggle(KEY_VIBRATION, true),
    setVibrationEnabled: (v) => setToggle(KEY_VIBRATION, !!v),
    getColorBlindEnabled: () => getToggle(KEY_COLORBLIND, false),
    setColorBlindEnabled: (v) => setToggle(KEY_COLORBLIND, !!v),
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.StorageAPI = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
