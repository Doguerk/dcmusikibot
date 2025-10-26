(function(global){
  'use strict';
  // Stub client-side leaderboard. No network requests; uses in-memory list with localStorage persistence.
  const KEY = 'colorflow_leaderboard';

  function read(){
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    } catch(e){}
    return [];
  }
  function write(arr){
    try { window.localStorage.setItem(KEY, JSON.stringify(arr)); } catch(e){}
  }

  async function postScore({ name, score }){
    const list = read();
    list.push({ name: String(name||'Anon').slice(0,16), score: Math.max(0, Math.floor(score||0)), date: Date.now() });
    list.sort((a,b)=> b.score - a.score);
    write(list.slice(0,50));
    // Emulate POST /leaderboard {name,score}
    return { ok: true };
  }

  async function getTop({ top = 10 } = {}){
    const list = read();
    // Emulate GET /leaderboard?top=10
    return list.slice(0, Math.max(1, Math.min(100, top)));
  }

  const api = { postScore, getTop };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.LeaderboardClient = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
