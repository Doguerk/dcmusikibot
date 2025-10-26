(function(global){
  'use strict';
  // UI/HUD and dialogs
  const els = {};
  function qs(id){ return document.getElementById(id); }

  function initUI(){
    els.score = qs('score');
    els.multiplier = qs('multiplier');
    els.best = qs('best');
    els.overlay = qs('overlay');
    els.finalScore = qs('final-score');
    els.finalBest = qs('final-best');
    els.playAgain = qs('play-again');
    els.pauseBtn = qs('pause-btn');
    els.restartBtn = qs('restart-btn');
    els.shareBtn = qs('share-btn');

    els.soundToggle = qs('sound-toggle');
    els.vibrationToggle = qs('vibration-toggle');
    els.colorBlindToggle = qs('colorblind-toggle');

    // Initialize toggles from storage
    if (global.StorageAPI) {
      els.soundToggle.checked = global.StorageAPI.getSoundEnabled();
      els.vibrationToggle.checked = global.StorageAPI.getVibrationEnabled();
      els.colorBlindToggle.checked = global.StorageAPI.getColorBlindEnabled();
    }

    els.soundToggle.addEventListener('change', () => {
      global.StorageAPI?.setSoundEnabled(els.soundToggle.checked);
      global.AudioAPI?.setEnabled(els.soundToggle.checked);
    });
    global.AudioAPI?.setEnabled(els.soundToggle.checked);

    els.vibrationToggle.addEventListener('change', () => {
      global.StorageAPI?.setVibrationEnabled(els.vibrationToggle.checked);
    });

    els.colorBlindToggle.addEventListener('change', () => {
      global.StorageAPI?.setColorBlindEnabled(els.colorBlindToggle.checked);
      global.dispatchEvent(new CustomEvent('cf:colorblind-changed', { detail: { enabled: els.colorBlindToggle.checked } }));
    });

    // Share
    els.shareBtn.addEventListener('click', () => {
      const scoreText = els.finalScore?.textContent || els.score?.textContent || '0';
      const shareData = {
        title: 'Color Flow',
        text: `I scored ${scoreText} in Color Flow!`,
        url: location.href.replace('/play/', '/'),
      };
      if (navigator.share) {
        navigator.share(shareData).catch(()=>{});
      } else {
        navigator.clipboard?.writeText(`${shareData.text} ${shareData.url}`);
        alert('Share link copied to clipboard!');
      }
    });

    // Message API from parent
    window.addEventListener('message', (e) => {
      const data = e?.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'SET_MODE') {
        const mode = data.mode;
        const colorBlind = mode === 'pattern';
        if (els.colorBlindToggle) {
          els.colorBlindToggle.checked = colorBlind;
          global.StorageAPI?.setColorBlindEnabled(colorBlind);
          global.dispatchEvent(new CustomEvent('cf:colorblind-changed', { detail: { enabled: colorBlind } }));
        }
      }
    });
  }

  function updateHUD(score, multiplier, best){
    if (els.score) els.score.textContent = String(score|0);
    if (els.multiplier) els.multiplier.textContent = (multiplier.toFixed ? multiplier.toFixed(1) : String(multiplier)) + 'x';
    if (els.best) els.best.textContent = String(best|0);
  }

  function showOverlay(score, best){
    if (els.finalScore) els.finalScore.textContent = String(score|0);
    if (els.finalBest) els.finalBest.textContent = String(best|0);
    els.overlay?.classList.add('show');
  }
  function hideOverlay(){ els.overlay?.classList.remove('show'); }

  const api = { initUI, updateHUD, showOverlay, hideOverlay, els };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.UILayer = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
