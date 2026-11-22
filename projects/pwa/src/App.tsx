import { Assistant } from './features/Assistant';
import { IdentifierInput, CommunityFields } from './components/IdentityFields';
import { dailyScreens, type DailyScreen } from '@open-mountain/design-system';
import { FullscreenToggle } from './components/FullscreenToggle';
import { Button, Panel } from './components/ui';
import React, { useEffect, useRef, useState } from 'react';
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
  const [dataOpen, setDataOpen] = useState(
    () => sessionStorage.getItem('backcountry-ops-data-open') === 'true',
  );
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 899px)').matches);
  const closeData = useRef<HTMLButtonElement>(null);
  const openData = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    sessionStorage.setItem('backcountry-ops-data-open', String(dataOpen));
    if (dataOpen && narrow) closeData.current?.focus();
    if (!dataOpen && wasOpen.current) openData.current?.focus();
    wasOpen.current = dataOpen;
  }, [dataOpen, narrow]);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 899px)');
    const update = () => setNarrow(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const { data, loading, busy, error, message, run, createProfile, restore, command } = workspace;
  const [tripId, setTripId] = useState(''),
    [date, setDate] = useState(''),
    [tab, setTab] = useState<DailyScreen>('briefing');
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
      <header inert={(narrow && dataOpen) || undefined}>
        <a className="brand" href="#main">
          △ <span>BACKCOUNTRY OPS</span>
        </a>
        <div className="header-meta">
          {data && (
            <Button
              type="button"
              ref={openData}
              aria-expanded={dataOpen}
              aria-controls="trip-data-panel"
              onClick={() => setDataOpen((v) => !v)}
            >
              Trip data
            </Button>
          )}
          {data && !dataOpen && (
            <Button
              type="button"
              onClick={() => {
                setDataOpen(true);
                requestAnimationFrame(() => {
                  const settings = document.getElementById('settings') as HTMLDetailsElement;
                  settings.open = true;
                  settings.scrollIntoView({ block: 'start' });
                });
              }}
            >
              Settings
            </Button>
          )}
          {!(narrow && dataOpen) && <FullscreenToggle />}
          <span className="status-dot" /> Solo · local only
          {data && <span className="user-chip">{data.personal.profile!.username}</span>}
        </div>
      </header>
      {error && !(narrow && dataOpen) && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {message && !(narrow && dataOpen) && (
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
          <Panel className="panel">
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
                      String(fields.get('communityId')),
                    ),
                  'Your local workspace is ready.',
                );
              }}
            >
              <fieldset disabled={busy} className="fields">
                <label>
                  Your username
                  <IdentifierInput
                    aria-label="Your username"
                    name="username"
                    autoComplete="nickname"
                    required
                    maxLength={80}
                    placeholder="e.g. alex"
                  />
                </label>
                <CommunityFields defaultName="My mountain community" />
                <Button className="primary">Create my workspace</Button>
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
          </Panel>
        </main>
      ) : (
        <div className={`assistant-layout ${dataOpen ? 'with-data' : ''}`}>
          <main id="main" className="assistant-primary" hidden={narrow && dataOpen}>
            <Assistant
              key={`${data.communityId}:${day?.id || 'planning'}`}
              workspace={featureWorkspace}
              day={day}
              trip={trip}
              onTripCreated={(id) => {
                setTripId(id);
                setDate('');
              }}
              onOpenData={() => setDataOpen(true)}
            />
          </main>
          <aside
            id="trip-data-panel"
            className="data-panel"
            aria-label="Trip data"
            role={narrow ? 'dialog' : undefined}
            aria-modal={narrow ? true : undefined}
            hidden={!dataOpen}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setDataOpen(false);
              if (narrow && e.key === 'Tab') {
                const elements = Array.from(
                  e.currentTarget.querySelectorAll<HTMLElement>(
                    'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), summary, a[href]',
                  ),
                ).filter((element) => element.getClientRects().length > 0);
                const first = elements[0],
                  last = elements[elements.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last?.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first?.focus();
                }
              }
            }}
          >
            <div className="data-panel-heading">
              <h2>Trip data</h2>
              <Button
                type="button"
                onClick={() => {
                  const settings = document.getElementById('settings') as HTMLDetailsElement;
                  settings.open = true;
                  settings.scrollIntoView({ block: 'start' });
                }}
              >
                Settings
              </Button>
              {narrow && <FullscreenToggle />}
              <Button type="button" ref={closeData} onClick={() => setDataOpen(false)}>
                Back to assistant
              </Button>
            </div>
            {narrow && dataOpen && error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            {narrow && dataOpen && message && (
              <p role="status" className="notice">
                {message}
              </p>
            )}
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
                  {!data.communityId && <option value="">No community selected</option>}
                  {data.personal.communities
                    .filter((c) => !c.removedAt)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </label>
            </section>
            <div className="workspace-layout">
              <aside className="trip-sidebar">
                <Panel className="panel">
                  <div className="section-heading">
                    <h2>My trips</h2>
                    <span className="count">{trips.length}</span>
                  </div>
                  <div className="trip-list">
                    {trips.map((t) => (
                      <Button
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
                          {t.startDate === t.endDate ? 'Day trip' : 'Multi-day trip'} ·{' '}
                          {t.startDate}
                        </small>
                      </Button>
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
                      <fieldset className="fields" disabled={busy || !data.communityId}>
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
                                end:
                                  e.target.value > tripDates.end ? e.target.value : tripDates.end,
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
                        <Button className="primary">Create trip</Button>
                      </fieldset>
                    </form>
                  </details>
                </Panel>
              </aside>
              <section id="data-main" className="daily-workspace">
                {!day ? (
                  <section className="empty welcome-empty">
                    <span>△</span>
                    <h2>Room for your next adventure</h2>
                    <p>
                      {data.communityId
                        ? 'Create a day trip or multi-day expedition to begin.'
                        : 'Open Settings to create a community, then plan your next trip.'}
                    </p>
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
                      {dailyScreens.map((item, index) => (
                        <Button
                          key={item.id}
                          aria-current={tab === item.id ? 'page' : undefined}
                          disabled={busy}
                          onClick={() => setTab(item.id)}
                        >
                          <span className="nav-index">0{index + 1}</span>
                          {item.label}
                        </Button>
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
                    {tab === 'routes' && (
                      <section className="extras" aria-label="Routes, exports & trip moves">
                        <Routes day={day} workspace={featureWorkspace} />
                        <div className="panel">
                          <h2>Portable field records</h2>
                          <Button
                            onClick={() =>
                              download(`backcountry-ops-${day.date}.json`, {
                                version: 2,
                                trip,
                                day,
                                events: data.events.filter(
                                  (event) => event.payload.dayId === day.id,
                                ),
                                source: 'Backcountry Ops local copy',
                              })
                            }
                          >
                            Export day — public data only
                          </Button>
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
                              <Button disabled={busy}>Confirm move</Button>
                              <p className="hint">
                                If that date already has a day: Merge — Coming soon. Both trips stay
                                unchanged.
                              </p>
                            </form>
                          )}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </section>
            </div>
            <Settings workspace={featureWorkspace} />
          </aside>
        </div>
      )}
      <footer hidden={narrow && dataOpen}>
        <span>Open technology. Your own mountain days.</span>
        <span>No API · No sync · AI not configured</span>
      </footer>
    </div>
  );
}
