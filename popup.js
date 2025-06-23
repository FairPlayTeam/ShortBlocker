// retrieves and displays preferences
const prefs = {
  ytShorts: 'filterYtShorts',
  blockTikTok: 'blockTikTok',
  snapVert: 'filterSnapVert',
  customList: 'blockedDomains'
};

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(Object.values(prefs), store => {
    Object.keys(prefs).forEach(key => {
      if (key !== 'customList') {
        const checkbox = document.getElementById(key);
        checkbox.checked = !!store[prefs[key]];
        checkbox.addEventListener('change', () => {
          chrome.storage.sync.set({ [prefs[key]]: checkbox.checked }, notifyBackground);
        });
      }
    });
    // initializing custom domain list
    window.blocked = store[prefs.customList] || [];
    // Display the custom domain list on load
    renderCustomDomainList();
  });

  document.getElementById('addDomain').addEventListener('click', () => {
    const dom = document.getElementById('customDomain').value.trim();
    if (!dom) return;
    const idx = window.blocked.indexOf(dom);
    if (idx === -1) {
      window.blocked.push(dom);
      alert(`${dom} added to the blacklist.`);
    } else {
      window.blocked.splice(idx, 1);
      alert(`${dom} removed from the blacklist.`);
    }
    renderCustomDomainList();
    chrome.storage.sync.set({ [prefs.customList]: window.blocked }, notifyBackground);
    document.getElementById('customDomain').value = '';
  });
});

// Function to render the custom domain list
function renderCustomDomainList() {
 let list = document.getElementById("customDomainList");
  list.innerHTML = ''; // Clear existing list
  for (let i = 0; i < window.blocked.length; ++i) {
    let li = document.createElement('li');
    li.innerText = window.blocked[i];
    list.appendChild(li);
  }
}

function notifyBackground() {
  chrome.runtime.sendMessage({ type: 'updateRules' });
}