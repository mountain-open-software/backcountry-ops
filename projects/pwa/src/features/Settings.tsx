import { StorageHealth } from '../components/StorageHealth';
import { Button, Panel } from '../components/ui';
import type { ReadyWorkspace } from '../types';
import React, { useEffect, useState } from 'react';
import { download } from '../files';
export function Settings({ workspace }: { workspace: ReadyWorkspace }) {
  const { data, busy, run, personalCommand, command, addCommunity, storage, restore } = workspace;
  const [legacy, setLegacy] = useState<Record<string, unknown>[]>([]);
  useEffect(() => {
    storage
      .legacy()
      .then(setLegacy)
      .catch(() => {});
  }, [storage]);
  return (
    <details className="settings">
      <summary>Profile & local backups</summary>
      <div className="settings-grid">
        <Panel className="panel">
          <h2>Local identity</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = new FormData(e.currentTarget).get('username');
              run(
                () => personalCommand('ProfileConfigured', { username: String(name) }),
                'Username updated; your stable user ID is unchanged.',
              );
            }}
          >
            <label>
              Username
              <input
                aria-label="Username"
                name="username"
                defaultValue={data.personal.profile!.username}
                required
                maxLength={80}
              />
            </label>
            <Button disabled={busy}>Update username</Button>
          </form>
          <p className="hint">
            No password, login, synchronization, or server. Independent copies require manual
            re-entry. This is not encrypted shared-device storage.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const name = new FormData(form).get('community');
              if (await run(() => addCommunity(String(name).trim()), 'Local community created.'))
                form.reset();
            }}
          >
            <label>
              New local community
              <input aria-label="New local community" name="community" required maxLength={100} />
            </label>
            <Button disabled={busy}>Create community</Button>
          </form>
        </Panel>
        <Panel className="panel">
          <h2>Backup & restore</h2>
          <StorageHealth />
          <p className="hint">
            Browser data can be cleared. Full backups include all your community data, original
            files/audio, and private notes. Keep backups private. Restore accepts the same history
            or a newer continuation; it never silently merges divergent histories.
          </p>
          <Button
            disabled={busy}
            onClick={() =>
              run(
                async () =>
                  download(
                    'open-mountain-local-backup.json',
                    await storage.exportBackup(
                      data.userId,
                      data.personal.communities.map((c) => c.id),
                    ),
                  ),
                'Backup downloaded. Store it somewhere safe.',
              )
            }
          >
            Export full backup — includes private notes
          </Button>
          <label className="file-label">
            Restore my local backup
            <input
              disabled={busy}
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                run(async () => {
                  if (file.size > 100 * 1024 * 1024)
                    throw new Error('Backup must be at most 100 MB');
                  await restore(JSON.parse(await file.text()));
                }, 'Backup restored.');
              }}
            />
          </label>
          <p className="service-note">Server collaboration, AI, and day merging: coming later.</p>
        </Panel>
        {legacy.length > 0 && (
          <Panel className="panel">
            <h2>Previous-version archive</h2>
            <p>
              The earlier scaffold has {legacy.length} records in its original database. They remain
              untouched. Export them before clearing browser storage; they have no reliable trip/day
              associations to migrate automatically.
            </p>
            <Button
              onClick={() =>
                download('open-mountain-legacy-records.json', { version: 1, documents: legacy })
              }
            >
              Export previous-version records
            </Button>
          </Panel>
        )}
      </div>
    </details>
  );
}
