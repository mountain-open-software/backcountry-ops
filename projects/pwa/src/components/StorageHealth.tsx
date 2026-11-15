import React, { useEffect, useState } from 'react';
import { Button } from './ui';
export function StorageHealth() {
  const [estimate, setEstimate] = useState<StorageEstimate | null>(null),
    [persistent, setPersistent] = useState<boolean | null>(null),
    [message, setMessage] = useState('');
  useEffect(() => {
    navigator.storage
      ?.estimate?.()
      .then(setEstimate)
      .catch(() => {});
    navigator.storage
      ?.persisted?.()
      .then(setPersistent)
      .catch(() => {});
  }, []);
  const ratio = estimate?.usage && estimate.quota ? estimate.usage / estimate.quota : 0;
  return (
    <div className={ratio > 0.8 ? 'error' : 'service-note'}>
      <p>
        Device storage:{' '}
        {estimate?.quota
          ? `${((estimate.usage || 0) / 1048576).toFixed(1)} MB used of ${(estimate.quota / 1048576).toFixed(0)} MB available to this site.`
          : 'This browser does not report a quota.'}
      </p>
      {ratio > 0.8 && (
        <p role="alert">
          Storage is running low. Export a full backup and original recordings before clearing any
          data.
        </p>
      )}
      <p>
        {persistent
          ? 'Persistent storage granted; backups are still important.'
          : 'Export a backup before clearing browser data, changing site origins, or leaving important field records on this device.'}
      </p>
      {navigator.storage?.persist && !persistent && (
        <Button
          type="button"
          onClick={async () => {
            let granted = false;
            try {
              granted = await navigator.storage.persist();
            } catch {
              setMessage(
                'Persistence is unavailable. Continue locally and keep an external backup.',
              );
              return;
            }
            setPersistent(granted);
            setMessage(
              granted
                ? 'Browser persistence granted.'
                : 'Persistence was not granted. The app still works; keep external backups.',
            );
          }}
        >
          Request persistent storage
        </Button>
      )}
      {message && <p role="status">{message}</p>}
      <p>
        Autosaved text drafts are for local recovery and are excluded from portable backups. Save
        records before exporting.
      </p>
    </div>
  );
}
