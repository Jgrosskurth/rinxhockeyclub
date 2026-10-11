/*
 * Install Prompt Block
 * "Add to your home screen" bar pinned to the bottom of the screen on phones
 * and tablets. Off by default. Turn it on for every page by publishing the DA
 * page /fragments/install-prompt (see delayed.js), or for one page by adding
 * an Install Prompt block to it. Optional rows, in order: title, message,
 * button label. Hidden once the site runs as an installed app, or after the
 * visitor installs or closes it.
 */

const DISMISSED = 'pwa-banner-dismissed';
const DEFAULTS = ['Rinx Hockey Club', 'Add to your home screen for quick access', 'Install'];

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

function dismiss(bar) {
  bar.remove();
  document.body.classList.remove('has-install-prompt');
  localStorage.setItem(DISMISSED, '1');
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [title, message, label] = DEFAULTS.map((fallback, i) => (
    block.children[i]?.textContent.trim() || fallback));
  block.textContent = '';
  block.hidden = true;

  const standalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone;
  if (standalone || localStorage.getItem(DISMISSED)
    || document.querySelector('.install-prompt-bar')) return;

  const bar = document.createElement('div');
  bar.className = 'install-prompt-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Install the app');
  bar.innerHTML = `
    <img src="/icons/rinx-header-128.webp" alt="" width="36" height="36">
    <p class="install-prompt-text"><strong></strong><span></span></p>
    <button type="button" class="install-prompt-btn"></button>
    <button type="button" class="install-prompt-close" aria-label="Close">&times;</button>`;
  bar.querySelector('strong').textContent = title;
  bar.querySelector('span').textContent = message;
  bar.querySelector('.install-prompt-btn').textContent = label;

  bar.querySelector('.install-prompt-btn').addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => dismiss(bar));
    } else {
      // iOS Safari has no install prompt API.
      // eslint-disable-next-line no-alert
      alert('Tap the Share button in your browser, then "Add to Home Screen".');
      dismiss(bar);
    }
  });
  bar.querySelector('.install-prompt-close').addEventListener('click', () => dismiss(bar));

  document.body.append(bar);
  document.body.classList.add('has-install-prompt');
}
