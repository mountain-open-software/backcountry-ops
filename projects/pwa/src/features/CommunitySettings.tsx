import React, { useState } from 'react';
import { Button, Panel } from '../components/ui';
import { CommunityFields } from '../components/IdentityFields';
import type { ReadyWorkspace } from '../types';
export function CommunitySettings({ workspace }: { workspace: ReadyWorkspace }) {
  const { data, busy, run, refresh, addCommunity, renameCommunity, deleteCommunity } = workspace;
  const [createKey, setCreateKey] = useState(0);
  const active = data.personal.communities.filter((c) => !c.removedAt);
  const selected = data.state.community;
  return (
    <>
      <Panel className="panel">
        <h2>Selected community</h2>
        {selected ? (
          <form
            key={selected.id + selected.name}
            onSubmit={(e) => {
              e.preventDefault();
              const name = String(new FormData(e.currentTarget).get('name')).trim();
              void run(
                () => renameCommunity(selected.id, name),
                'Community updated. Its ID and trips are unchanged.',
              );
            }}
          >
            <label>
              Community name
              <input
                aria-label="Selected community name"
                name="name"
                defaultValue={selected.name}
                required
                maxLength={100}
                disabled={busy}
              />
            </label>
            <label>
              Community ID
              <input aria-label="Selected community ID" value={selected.id} readOnly />
            </label>
            <p className="hint">
              The name can contain capitals and spaces. The ID is fixed after creation.
            </p>
            <Button disabled={busy}>Save community</Button>
          </form>
        ) : (
          <p>No community selected. Create a community below to start planning.</p>
        )}
      </Panel>
      <Panel className="panel">
        <h2>My communities</h2>
        {!active.length && <p>No active communities.</p>}
        {active.map((c) => (
          <article key={c.id}>
            <h3>{c.name}</h3>
            <p className="meta">ID: {c.id}</p>
            <div className="row">
              <Button
                type="button"
                disabled={busy || data.communityId === c.id}
                onClick={() => void run(() => refresh(c.id))}
              >
                {data.communityId === c.id ? 'Selected community' : `Select ${c.name}`}
              </Button>
              <Button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (
                    window.confirm(
                      `Delete ${c.name}? It will be removed from active communities. Its trips, recordings and event history remain in full backups. The ID stays reserved.`,
                    )
                  )
                    void run(
                      () => deleteCommunity(c.id),
                      'Community deleted from active use. History remains in backups.',
                    );
                }}
              >
                Delete {c.name}
              </Button>
            </div>
          </article>
        ))}
        <h3>Create community</h3>
        <form
          key={createKey}
          onSubmit={async (e) => {
            e.preventDefault();
            const fields = new FormData(e.currentTarget);
            if (
              await run(
                () =>
                  addCommunity(
                    String(fields.get('community')).trim(),
                    String(fields.get('communityId')),
                  ),
                'Community created.',
              )
            )
              setCreateKey((v) => v + 1);
          }}
        >
          <fieldset disabled={busy} className="fields">
            <CommunityFields nameLabel="New local community" />
            <Button>Create community</Button>
          </fieldset>
        </form>
      </Panel>
    </>
  );
}
