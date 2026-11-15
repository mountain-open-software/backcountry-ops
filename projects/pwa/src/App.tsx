import React, { useState } from 'react';
import { useWorkspace } from './useWorkspace';
import { Briefing } from './features/Briefing';
import { Observations } from './features/Observations';
import { Debrief } from './features/Debrief';
import { Timeline } from './features/Timeline';
import { Routes } from './features/Routes';
import { Settings } from './features/Settings';
import { download } from './files';
function today() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
export default function App() {
  const workspace = useWorkspace();
  const { data, loading, busy, error, message, run, createProfile, restore, command } = workspace;
  const [tripId, setTripId] = useState(''),
    [date, setDate] = useState(''),
    [tab, setTab] = useState('briefing');
  const [tripDates, setTripDates] = useState({ start: today(), end: today() });
  const trips = Object.values(data?.state?.trips || {}).filter((t) => !t.movedTo);
  const trip = trips.find((t) => t.id === tripId) || trips[0];
  const days = Object.values(data?.state?.days || {})
    .filter((d) => d.tripId === trip?.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  const day = days.find((d) => d.date === date) || days[0];
  const featureWorkspace = { ...workspace, data: data! };
  return (
    <div className="shell">
      <header>
        <a className="brand" href="#main">
          △ <span>OPEN MOUNTAIN</span>
        </a>
        <div className="header-meta">
          <span className="status-dot" /> Solo · local only
          {data && <span className="user-chip">{data.personal.profile!.username}</span>}
        </div>
      </header>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {loading ? (
        <main id="main">
          <p role="status">Opening your local workspace…</p>
        </main>
      ) : !data ? (
        <main id="main" className="onboarding">
          <section>
            <p className="eyebrow">INDEPENDENT BY DESIGN</p>
            <h1>
              Your next day
              <br />
              starts here.
            </h1>
            <p className="intro-copy">
              A clear plan. Your own observations.
              <br />A record of what changed along the way.
            </p>
            <div className="intro-points">
              <span>◌ Works offline</span>
              <span>◌ Your data stays here</span>
              <span>◌ No account required</span>
            </div>
          </section>
          <section className="panel">
            <h2>Set up your local profile</h2>
            <p className="hint">
              One username and a local community workspace. No password or server required.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fields = new FormData(e.currentTarget);
                run(
                  () =>
                    createProfile(
                      String(fields.get('username')).trim(),
                      String(fields.get('community')).trim(),
                    ),
                  'Your local workspace is ready.',
                );
              }}
            >
              <fieldset disabled={busy} className="fields">
                <label>
                  Your username
                  <input
                    aria-label="Your username"
                    name="username"
                    autoComplete="nickname"
                    required
                    maxLength={80}
                    placeholder="e.g. Alex"
                  />
                </label>
                <label>
                  Community name
                  <input
                    aria-label="Community name"
                    name="community"
                    required
                    maxLength={100}
                    defaultValue="My mountain community"
                  />
                </label>
                <button className="primary">Create my workspace</button>
              </fieldset>
            </form>
            <label className="file-label">
              Or restore a local backup
              <input
                disabled={busy}
                type="file"
                accept="application/json,.json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file)
                    run(async () => {
                      if (file.size > 100 * 1024 * 1024)
                        throw new Error('Backup must be at most 100 MB');
                      await restore(JSON.parse(await file.text()));
                    }, 'Workspace restored.');
                }}
              />
            </label>
          </section>
        </main>
      ) : (
        <>
          <section className="workspace-heading">
            <div>
              <p className="eyebrow">YOUR BACKCOUNTRY WORKSPACE</p>
              <h1>
                Make a plan.
                <br className="desktop-break" /> Keep a field record.
              </h1>
            </div>
            <label className="community-select">
              Local community
              <select
                aria-label="Local community"
                disabled={busy}
                value={data.communityId || ''}
                onChange={(e) => {
                  setTripId('');
                  setDate('');
                  run(() => workspace.refresh(e.target.value));
                }}
              >
                {data.personal.communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </section>
          <div className="workspace-layout">
            <aside className="trip-sidebar">
              <section className="panel">
                <div className="section-heading">
                  <h2>My trips</h2>
                  <span className="count">{trips.length}</span>
                </div>
                <div className="trip-list">
                  {trips.map((t) => (
                    <button
                      key={t.id}
                      className={t.id === trip?.id ? 'trip-choice selected' : 'trip-choice'}
                      aria-pressed={t.id === trip?.id}
                      disabled={busy}
                      onClick={() => {
                        setTripId(t.id);
                        setDate('');
                      }}
                    >
                      <strong>{t.title}</strong>
                      <small>
                        {t.startDate === t.endDate ? 'Day trip' : 'Multi-day trip'} · {t.startDate}
                      </small>
                    </button>
                  ))}
                </div>
                <details open={!trips.length} className="new-trip">
                  <summary>＋ Plan a trip</summary>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget,
                        fields = new FormData(form),
                        id = crypto.randomUUID();
                      const ok = await run(
                        () =>
                          command('TripCreated', {
                            id,
                            title: String(fields.get('title')).trim(),
                            startDate: tripDates.start,
                            endDate: tripDates.end,
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
                          }),
                        'Trip created. One operational day per date.',
                      );
                      if (ok) {
                        setTripId(id);
                        setDate(tripDates.start);
                        form.reset();
                      }
                    }}
                  >
                    <fieldset className="fields" disabled={busy}>
                      <label>
                        Trip name
                        <input aria-label="Trip name" name="title" required maxLength={120} />
                      </label>
                      <label>
                        Start date
                        <input
                          aria-label="Start date"
                          type="date"
                          required
                          value={tripDates.start}
                          onChange={(e) =>
                            setTripDates({
                              start: e.target.value,
                              end: e.target.value > tripDates.end ? e.target.value : tripDates.end,
                            })
                          }
                        />
                      </label>
                      <label>
                        End date
                        <input
                          aria-label="End date"
                          type="date"
                          required
                          min={tripDates.start}
                          value={tripDates.end}
                          onChange={(e) => setTripDates({ ...tripDates, end: e.target.value })}
                        />
                      </label>
                      <p className="hint">
                        Same date for a day trip; up to 90 days for an expedition. Time zone:{' '}
                        {Intl.DateTimeFormat().resolvedOptions().timeZone}.
                      </p>
                      <button className="primary">Create trip</button>
                    </fieldset>
                  </form>
                </details>
              </section>
            </aside>
            <main id="main" className="daily-workspace">
              {!day ? (
                <section className="empty welcome-empty">
                  <span>△</span>
                  <h2>Room for your next adventure</h2>
                  <p>Create a day trip or multi-day expedition to begin.</p>
                  <p className="hint">
                    Your solo copy works without an API, login, or synchronization.
                  </p>
                </section>
              ) : (
                <>
                  <section className="day-heading">
                    <div>
                      <p className="eyebrow">
                        {trip.startDate === trip.endDate ? 'DAY TRIP' : 'EXPEDITION'} ·{' '}
                        {day.closedAt ? 'CLOSED · OBSERVATIONS STILL OPEN' : 'OPERATIONAL DAY'}
                      </p>
                      <h2>{trip.title}</h2>
                      <p className="hint">
                        {trip.timeZone} · You are the sole participant and local leader.
                      </p>
                    </div>
                    <label>
                      Day
                      <select
                        aria-label="Operational day"
                        disabled={busy}
                        value={day.date}
                        onChange={(e) => setDate(e.target.value)}
                      >
                        {days.map((d) => (
                          <option key={d.id} value={d.date}>
                            {d.date}
                            {d.closedAt ? ' · Closed' : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                  </section>
                  <nav className="workflow-nav" aria-label="Daily workflow">
                    {(
                      [
                        { id: 'briefing', label: 'Briefing' },
                        { id: 'observations', label: 'Observations' },
                        { id: 'debrief', label: 'Debrief & close' },
                        { id: 'timeline', label: 'Timeline' },
                      ] as const
                    ).map((item, index) => (
                      <button
                        key={item.id}
                        aria-current={tab === item.id ? 'page' : undefined}
                        disabled={busy}
                        onClick={() => setTab(item.id)}
                      >
                        <span className="nav-index">0{index + 1}</span>
                        {item.label}
                      </button>
                    ))}
                  </nav>
                  {tab === 'briefing' && (
                    <Briefing
                      key={`${day.id}-${day.briefing?.version || 0}`}
                      day={day}
                      workspace={featureWorkspace}
                    />
                  )}
                  {tab === 'observations' && (
                    <Observations key={day.id} day={day} workspace={featureWorkspace} />
                  )}
                  {tab === 'debrief' && (
                    <Debrief key={day.id} day={day} workspace={featureWorkspace} />
                  )}
                  {tab === 'timeline' && (
                    <Timeline
                      day={day}
                      events={data.events}
                      trip={trip}
                      username={data.personal.profile!.username}
                    />
                  )}
                  <details className="extras">
                    <summary>Routes, exports & trip moves</summary>
                    <Routes day={day} workspace={featureWorkspace} />
                    <div className="panel">
                      <h2>Portable field records</h2>
                      <button
                        onClick={() =>
                          download(`open-mountain-${day.date}.json`, {
                            version: 2,
                            trip,
                            day,
                            events: data.events.filter((event) => event.payload.dayId === day.id),
                            source: 'Open Mountain local copy',
                          })
                        }
                      >
                        Export this day — public data only
                      </button>
                      <p className="hint">
                        Private human-factor notes are not included. Use a full local backup for
                        audio files and private recovery.
                      </p>
                      {trip.startDate === trip.endDate && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const targetId = new FormData(e.currentTarget).get('target');
                            if (
                              window.confirm(
                                'Move this day trip and its history into the selected expedition? Its date range will extend if necessary. A conflicting day is not merged.',
                              )
                            )
                              run(
                                () =>
                                  command('TripMoved', {
                                    sourceId: trip.id,
                                    targetId: String(targetId),
                                    confirmed: true,
                                  }),
                                'Day trip moved.',
                              );
                          }}
                        >
                          <label>
                            Move into an expedition
                            <select aria-label="Move into an expedition" name="target" required>
                              <option value="">Choose an expedition</option>
                              {trips
                                .filter((t) => t.id !== trip.id && t.startDate !== t.endDate)
                                .map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.title}
                                  </option>
                                ))}
                            </select>
                          </label>
                          <button disabled={busy}>Confirm move</button>
                          <p className="hint">
                            If that date already has a day: Merge — Coming soon. Both trips stay
                            unchanged.
                          </p>
                        </form>
                      )}
                    </div>
                  </details>
                </>
              )}
            </main>
          </div>
          <Settings workspace={featureWorkspace} />
        </>
      )}
      <footer>
        <span>Open technology. Your own mountain days.</span>
        <span>No API · No sync · AI not configured</span>
      </footer>
    </div>
  );
}
