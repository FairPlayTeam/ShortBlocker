(async () => {
  // Check whether the extension is running in Firefox
  const isFirefox = typeof browser !== 'undefined';

  // Use the appropriate API
  const storage = isFirefox ? browser.storage.sync : chrome.storage.sync;

  const { filterYtShorts = false, filterSnapVert = false } =
    await storage.get(['filterYtShorts', 'filterSnapVert']);

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

    /* Note: Tiktok is handled by background.js the same way as custom domains
    Consider handling TikTok here as well for consistency, 
    or show it in the custom domain list by default. */
    
    // TODO: --- Instagram Reels ---
  }
})();