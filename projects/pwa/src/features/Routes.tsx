import type { DayProps } from '../types';
import React from 'react';
import { download, readGPX } from '../files';
export function Routes({ day, workspace }: DayProps) {
  const { data, busy, run, command, storage } = workspace;
  return (
    <section className="panel route-panel">
      <h2>Routes & tracks</h2>
      <p className="hint">
        Use your own navigation app. Upload GPX or add a Strava, Outmap, or other link. Links alone
        are not available offline. No GPS track recording or route drawing.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget,
            values = new FormData(form);
          const ok = await run(async () => {
            const file = values.get('gpx');
            let metadata = {},
              fileId = null;
            if (file instanceof File && file.size) {
              metadata = await readGPX(file);
              fileId = await storage.putFile('community', data.communityId, file);
            }
            await command('RouteAttached', {
              dayId: day.id,
              title: String(values.get('title')),
              kind: String(values.get('kind')) as 'planned' | 'actual',
              url: String(values.get('url') || ''),
              fileId,
              fileName: file instanceof File ? file.name : null,
              ...metadata,
            });
          }, 'Route reference saved locally.');
          if (ok) form.reset();
        }}
      >
        <fieldset disabled={busy} className="fields">
          <div className="row">
            <label>
              Route title
              <input aria-label="Route title" name="title" required />
            </label>
            <label>
              Route type
              <select aria-label="Route type" name="kind">
                <option value="planned">Planned route</option>
                <option value="actual">Recorded track</option>
              </select>
            </label>
          </div>
          <label>
            External route link
            <input aria-label="External route link" type="url" name="url" placeholder="https://…" />
          </label>
          <label>
            Or upload GPX
            <input
              aria-label="Or upload GPX"
              type="file"
              name="gpx"
              accept=".gpx,application/gpx+xml"
            />
          </label>
          <button>Save route reference</button>
        </fieldset>
      </form>
      {day.routes.map((route, index) => (
        <article key={index}>
          <h3>{route.title}</h3>
          <p className="meta">
            {route.kind === 'actual' ? 'Recorded track' : 'Planned route'}
            {route.points ? ` · ${route.points} points · ${route.segments} segments` : ''}
          </p>
          <div className="row">
            {route.url && (
              <a className="button-link" href={route.url} target="_blank" rel="noreferrer noopener">
                Open external app ↗
              </a>
            )}
            {route.fileId && (
              <button
                disabled={busy}
                onClick={() =>
                  run(async () =>
                    download(
                      route.fileName || 'route.gpx',
                      await storage.getFile('community', data.communityId, route.fileId!),
                    ),
                  )
                }
              >
                Download original GPX
              </button>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
