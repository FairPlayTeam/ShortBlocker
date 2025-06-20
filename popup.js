// récupère et affiche les préférences
const prefs = {
  ytShorts: 'filterYtShorts',
  igReels: 'filterIgReels',
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
    // initialisation de la liste des domaines personnalisées
    window.blocked = store[prefs.customList] || [];
  });

  document.getElementById('addDomain').addEventListener('click', () => {
    const dom = document.getElementById('customDomain').value.trim();
    if (!dom) return;
    const idx = window.blocked.indexOf(dom);
    if (idx === -1) {
      window.blocked.push(dom);
      alert(`${dom} ajouté à la liste de blocage.`);
    } else {
      window.blocked.splice(idx,1);
      alert(`${dom} retiré de la liste de blocage.`);
    }
    chrome.storage.sync.set({ [prefs.customList]: window.blocked }, notifyBackground);
    document.getElementById('customDomain').value = '';
  });
});

// prévenir le background de recharger les règles
function notifyBackground() {
  chrome.runtime.sendMessage({ type: 'updateRules' });
}
