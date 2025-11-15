// Check whether the extension is running in Firefox
const isFirefox = typeof browser !== 'undefined';

// Use the appropriate API
const storage = isFirefox ? browser.storage.sync : chrome.storage.sync;
const declarativeNetRequest = isFirefox ? browser.declarativeNetRequest : chrome.declarativeNetRequest;
const runtime = isFirefox ? browser.runtime : chrome.runtime;

async function updateBlockingRules() {
  const { blockTikTok = false, blockedDomains = [] } =
    await storage.get({ blockTikTok: false, blockedDomains: [] });

  // Retrieve and remove existing rules
  const existingRules = await declarativeNetRequest.getDynamicRules();
  const ruleIdsToRemove = existingRules.map(rule => rule.id);

  // Create new rules
  const newRules = [];
  let nextId = 1;

  if (blockTikTok) {
    newRules.push({
      id: nextId++,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { extensionPath: '/blocked/blocked.html' },
      },
      condition: {
        urlFilter: '||tiktok.com',
        resourceTypes: ['main_frame'],
      },
    });
  }

  blockedDomains.forEach(domain => {
    newRules.push({
      id: nextId++,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { extensionPath: '/blocked/blocked.html' },
      },
      condition: {
        urlFilter: `||${domain}`,
        resourceTypes: ['main_frame'],
      },
    });
  });

  // Update the rules
  await declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ruleIdsToRemove,
    addRules: newRules,
  });
}

// Events
runtime.onInstalled.addListener(updateBlockingRules);
runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.type === 'updateRules') {
    updateBlockingRules().then(sendResponse);
    return true;
  }
});