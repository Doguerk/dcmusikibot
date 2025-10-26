(function(){
  'use strict';
  // Site and menu logic shared across pages
  document.addEventListener('DOMContentLoaded', () => {
    // Register service worker if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js', { scope: './' }).catch(() => {});
    }

    // Smooth scroll for CTA if present
    const playNow = document.getElementById('play-now');
    if (playNow) {
      playNow.addEventListener('click', () => {
        // nothing fancy, link handles navigation
      });
    }
  });
})();
