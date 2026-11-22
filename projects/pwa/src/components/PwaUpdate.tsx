import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from './ui';
import { settleDrafts } from '../pwaDrafts';

export function PwaUpdate() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>();
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, value) {
      setRegistration(value);
    },
    onRegisterError(error) {
      console.warn('PWA update registration failed', error);
    },
  });
  useEffect(() => {
    if (!registration) return;
    const check = () => {
      if (navigator.onLine && document.visibilityState === 'visible')
        void registration.update().catch(() => {
          /* Offline use remains available. */
        });
    };
    check();
    const timer = window.setInterval(check, 60 * 60 * 1000);
    window.addEventListener('online', check);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', check);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [registration]);
  if (!needRefresh) return null;
  async function apply() {
    setApplying(true);
    setError('');
    try {
      await settleDrafts();
      await updateServiceWorker(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not update. Try again.');
      setApplying(false);
    }
  }
  return (
    <aside className="pwa-update" role="status" aria-label="App update">
      <strong>A new version of Backcountry Ops is ready.</strong>
      <p>
        Finish recording and processing before updating. Update reloads the app; saved local data
        stays on this device.
      </p>
      <Button type="button" disabled={applying} onClick={() => void apply()}>
        {applying ? 'Updating…' : 'Update app'}
      </Button>
      {error && <p role="alert">{error}</p>}
    </aside>
  );
}
