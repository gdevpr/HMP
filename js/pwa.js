// PWA glue: registers the service worker and wires the install-prompt
// banner. Pure side effects — call setupPWA() once from app.js after the DOM
// is ready. Kept separate so app.js stays focused on app orchestration.

export function setupPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => {}); });
  }

  let deferredPrompt = null;
  const banner = document.getElementById('install-banner');
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferredPrompt = e;
    if (!sessionStorage.getItem('install-dismissed')) banner.classList.add('visible');
  });
  document.getElementById('install-btn').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null; banner.classList.remove('visible');
  });
  document.getElementById('install-dismiss').addEventListener('click', () => {
    banner.classList.remove('visible'); sessionStorage.setItem('install-dismissed', '1');
  });
  window.addEventListener('appinstalled', () => { banner.classList.remove('visible'); deferredPrompt = null; });
}
