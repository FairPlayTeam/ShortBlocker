// Check whether the extension is running in Firefox
const isFirefox = typeof browser !== 'undefined';

// Use the appropriate API
const storage = isFirefox ? browser.storage.sync : chrome.storage.sync;
const runtime = isFirefox ? browser.runtime : chrome.runtime;

const PREFERENCES = {
  ytShorts: 'filterYtShorts',
  snapVert: 'filterSnapVert',
  igReels: 'filterInstaReels',
  blockTikTok: 'blockTikTok',
  customList: 'blockedDomains',
};

document.addEventListener('DOMContentLoaded', async () => {
  const {
    [PREFERENCES.ytShorts]: ytShorts,
    [PREFERENCES.snapVert]: snapVert,
    [PREFERENCES.igReels]: igReels,
    [PREFERENCES.blockTikTok]: blockTikTok,
    [PREFERENCES.customList]: blockedDomains = []
  } = await storage.get(Object.values(PREFERENCES));

  // Initialize checkboxes
  Object.entries({ ytShorts, snapVert, igReels, blockTikTok }).forEach(([key, value]) => {
    const checkbox = document.getElementById(key);
    if (checkbox) {
      checkbox.checked = !!value;
      checkbox.addEventListener('change', () => {
        storage.set({ [PREFERENCES[key]]: checkbox.checked }, notifyBackground);
      });
    }
  });

  // Initialize the list of blocked domains
  window.blocked = blockedDomains;
  renderCustomDomainList();

  window.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') addDomain();
  });

  document.getElementById('addDomain').addEventListener('click', () => {
    addDomain();
  });

  // Add a custom domain
  function addDomain() {
    const domain = document.getElementById('customDomain').value.trim();
    if (!domain) return;
    const index = window.blocked.indexOf(domain);
    if (index === -1) {
      window.blocked.push(domain);
    } else {
      window.blocked.splice(index, 1);
    }
    renderCustomDomainList();
    storage.set({ [PREFERENCES.customList]: window.blocked }, notifyBackground);
    document.getElementById('customDomain').value = '';
  }
});

// Display the list of blocked domains
function renderCustomDomainList() {
  const list = document.getElementById('customList');
  if (list) {
    list.innerHTML = window.blocked
      .map(domain => `
        <li>
          ${domain}
          <button class="delete-btn" data-domain="${domain}">×</button>
        </li>
      `)
      .join('');

    document.querySelectorAll('#customList .delete-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const domainToRemove = e.target.getAttribute('data-domain');
        const index = window.blocked.indexOf(domainToRemove);
        if (index !== -1) {
          window.blocked.splice(index, 1);
          renderCustomDomainList();
          storage.set({ [PREFERENCES.customList]: window.blocked }, notifyBackground);
        }
      });
    });
  }
}

// Notify the background to update the rules
function notifyBackground() {
  runtime.sendMessage({ type: 'updateRules' });
}