(async () => {
  // Check whether the extension is running in Firefox
  const isFirefox = typeof browser !== 'undefined';

  // Use the appropriate API
  const storage = isFirefox ? browser.storage.sync : chrome.storage.sync;

  const { filterYtShorts = false, filterSnapVert = false, filterInstaReels = false } =
    await storage.get(['filterYtShorts', 'filterSnapVert', 'filterInstaReels']);

  // --- YouTube Shorts ---
  if (filterYtShorts && location.host.includes('youtube.com')) {
    const removeYtShorts = () => {
      document.querySelectorAll('ytd-reel-shelf-renderer, ytd-rich-shelf-renderer[is-shorts]')
        .forEach(el => el.remove());
    };

    // Redirect if the URL contains "/shorts"
    if (location.pathname.includes("/shorts")) {
      const pathArray = location.pathname.split("/");
      const videoId = pathArray[pathArray.indexOf("shorts") + 1];
      location.replace(
        videoId
          ? `${location.protocol}//${location.host}/watch?v=${videoId}`
          : `${location.protocol}//${location.host}`
      );
    }

    // Observe DOM changes
    new MutationObserver(removeYtShorts).observe(document.body, {
      childList: true,
      subtree: true,
    });
    removeYtShorts();
  }

  // --- Snapchat Spotlight ---
  if (filterSnapVert && location.host.includes('snapchat.com')) {
    const replaceWithBlockedPage = async (el) => {
        const placeholder = document.createElement('div');
        placeholder.textContent = "Content blocked by Vertical Content Remover";
        el.replaceWith(placeholder);
    };

    const removeSnapVert = () => {
      document.querySelectorAll('[class*="vertical"], video[orientation="vertical"]')
        .forEach(el => replaceWithBlockedPage(el));
    };

    // Observe DOM changes
    new MutationObserver(removeSnapVert).observe(document.body, {
      childList: true,
      subtree: true,
    });
    removeSnapVert();
  }

  /* Note: Tiktok is handled by background.js the same way as custom domains
  Consider handling TikTok here as well for consistency, 
  or show it in the custom domain list by default. */

  // --- Instagram Reels ---
  if (filterInstaReels && location.host.includes('instagram.com')) {
    // Delete reels on the main feed
    if (location.host === "www.instagram.com" && location.pathname === "/") {
      const removeIgReels = () => {
        const videos = document.querySelectorAll('video[src^="blob:https://www.instagram.com"]');

        videos.forEach(video => {
          let target = video;
          // Go up 19 levels in the DOM to find the reel container
          for (let i = 0; i < 19 && target && target.parentElement; i++) {
            target = target.parentElement;
          }

          if (target) {
            target.remove();
          }
        });
      };

      // Observe DOM changes
      new MutationObserver(removeIgReels).observe(document.body, {
        childList: true,
        subtree: true,
      });
      removeIgReels();
    }

    // Remove "reels" and "explore" tab from navigation
    const removeIgReelsBtn = () => {
      document.querySelectorAll('a[href="/reels/"], a[href="/explore/"]').forEach(el => el.remove());
    }
    new MutationObserver(removeIgReelsBtn).observe(document.body, {
      childList: true,
      subtree: true,
    });
    removeIgReelsBtn();
  }
})();