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
  });

  document.getElementById('addDomain').addEventListener('click', () => {
    const dom = document.getElementById('customDomain').value.trim();
    if (!dom) return;
    const idx = window.blocked.indexOf(dom);
    if (idx === -1) {
      window.blocked.push(dom);
      let list = document.getElementById("customDomainList");
        for (i = 0; i < window.blocked.length; ++i) {
            let li = document.createElement('li');
            li.innerText = data[i];
            list.appendChild(li);
        }
      alert(`${dom} added to the blacklist.`);
    } else {
      window.blocked.splice(idx,1);
      let list = document.getElementById("customDomainList");
        for (i = 0; i < window.blocked.length; ++i) {
            let li = document.createElement('li');
            li.innerText = data[i];
            list.appendChild(li);
        }
      alert(`${dom} removed from the blacklist.`);
    }
    chrome.storage.sync.set({ [prefs.customList]: window.blocked }, notifyBackground);
    document.getElementById('customDomain').value = '';
  });
});

// prévenir le background de recharger les règles
function notifyBackground() {
  chrome.runtime.sendMessage({ type: 'updateRules' });
}
