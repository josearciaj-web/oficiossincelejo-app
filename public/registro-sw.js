if ('serviceWorker' in navigator && !new URLSearchParams(location.search).has('demo')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
