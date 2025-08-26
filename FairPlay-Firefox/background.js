// background.js

async function updateBlockingRules() {
  const { blockTikTok = false, blockedDomains = [] } =
    await chrome.storage.sync.get({
      blockTikTok: false,
      blockedDomains: []
    });

  // Récupère et supprime toutes les règles existantes
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map(r => r.id);

  const newRules = [];
  let nextId = 1;

  // Redirect TikTok
  if (blockTikTok) {
    newRules.push({
      id: nextId++,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { extensionPath: '/blocked.html' }
      },
      condition: {
        urlFilter: '||tiktok.com',
        resourceTypes: ['main_frame']
      }
    });
  }

  // Redirect domaines personnalisés
  for (const dom of blockedDomains) {
    newRules.push({
      id: nextId++,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { extensionPath: '/blocked.html' }
      },
      condition: {
        urlFilter: `||${dom}`,
        resourceTypes: ['main_frame']
      }
    });
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules: newRules
  });
}

chrome.runtime.onInstalled.addListener(updateBlockingRules);
chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
  if (msg.type === 'updateRules') {
    updateBlockingRules().then(() => sendResponse());
    return true;
  }
});
