const CURRENT_CACHE_NAME = 'caroni-pwa-v7';

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    // 1. Purge any legacy caches from previous versions on all environments
    if ('caches' in window) {
      caches
        .keys()
        .then((names) => {
          for (const name of names) {
            if (name !== CURRENT_CACHE_NAME) {
              caches.delete(name).catch(() => {});
            }
          }
        })
        .catch(() => {});
    }

    const hostname = window.location.hostname;
    const isDevOrPreviewHost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname.startsWith('ais-dev-');

    if (isDevOrPreviewHost) {
      // In local development or AI Studio dev preview, unregister any active service worker
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().catch(() => {});
          }
        })
        .catch(() => {});
      return;
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version ready
                }
              });
            }
          });
        })
        .catch(() => {
          // Silent fallback if Service Worker registration is restricted
        });
    });
  }
}
