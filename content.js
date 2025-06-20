// content.js

(async () => {
  const {
    filterYtShorts = false,
    filterIgReels = false,
    filterSnapVert = false
  } = await chrome.storage.sync.get([
    'filterYtShorts',
    'filterIgReels',
    'filterSnapVert'
  ]);

  // YouTube Shorts suppression
  if (filterYtShorts && location.host.includes('youtube.com')) {
    const removeYt = () => {
      document.querySelectorAll(
        'ytd-reel-shelf-renderer, ytd-rich-shelf-renderer[is-shorts]'
      ).forEach(e => e.remove());
    };
    new MutationObserver(removeYt).observe(document.body, {
      childList: true,
      subtree: true
    });
    removeYt();
  }

  // Snapchat vertical et son placeholder
  if (filterSnapVert && location.host.includes('snapchat.com')) {
    const replaceWithPlaceholder = el => {
      const ph = document.createElement('div');
      ph.style.cssText = `
        background: #fff3f3;
        border: 1px solid #f5c2c2;
        color: #a33;
        padding: 12px;
        margin: 8px 0;
        border-radius: 4px;
        text-align: center;
        font-family: sans-serif;
      `;
      ph.innerHTML = `
        <p style="margin:0 0 8px;">
          Supprimé par <strong>Vertical Content Bloquer</strong>
        </p>
        <button style="
          padding: 6px 12px;
          font-size: 0.9em;
          border:none;
          border-radius:3px;
          cursor:pointer;
          background:#007bff;
          color:#fff;
        "
        onclick="window.open('https://newstream.com','_blank')">
          Voir sur newstream.com
        </button>
      `;
      el.replaceWith(ph);
    };

    const obsSnap = () => {
      document
        .querySelectorAll('[class*="vertical"], video[orientation="vertical"]')
        .forEach(el => replaceWithPlaceholder(el));
    };
    new MutationObserver(obsSnap).observe(document.body, {
      childList: true,
      subtree: true
    });
    obsSnap();
  }
})();
