import './shim.js'; // optional, may not exist; ignored if 404
import '../js/config.js';
import '../js/storage.js';
import '../js/audio.js';
import '../js/ui.js';
import '../js/leaderboard-client.js';
import('../js/game.js').then(({ default: createGame }) => {
  window.addEventListener('DOMContentLoaded', () => {
    if (window.UILayer) window.UILayer.initUI();
    const canvas = document.getElementById('game-canvas');
    const game = createGame({ canvas });

    // Wire controls
    const els = window.UILayer?.els || {};
    els.pauseBtn?.addEventListener('click', () => {
      const paused = game.togglePause();
      els.pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      els.pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    });
    els.restartBtn?.addEventListener('click', () => { game.restart(); });
    els.playAgain?.addEventListener('click', () => { window.UILayer?.hideOverlay(); game.restart(); });

    // Initialize toggles from storage for audio
    window.AudioAPI?.setEnabled(window.StorageAPI?.getSoundEnabled());

    // Announce ready to parent for integrations
    try { window.parent !== window && window.parent.postMessage({ type: 'COLOR_FLOW_READY' }, '*'); } catch(e) {}
  });
}).catch((e) => {
  console.error('Failed to load game module', e);
});
