import { useDraft } from '../useDraft';
import { DraftStatus } from '../components/DraftStatus';
import { Button, Panel } from '../components/ui';
import type { Observation } from '@open-mountain/domain';
import type { DayProps } from '../types';
import React, { useEffect, useState } from 'react';
import { VoiceCapture, AudioPreview } from '../components/VoiceCapture';
import { download } from '../files';
function localTime(iso = new Date().toISOString()) {
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
export function Observations({ day, workspace }: DayProps) {
  const { data, busy, run, command, storage, setError } = workspace;
  const blank = (): Observation => ({
    id: '',
    title: '',
    notes: '',
    observedAt: localTime(),
    location: '',
    audioId: null,
    audioName: null,
  });
  const [form, setForm, draft, draftSession] = useDraft(
      storage,
      data.userId,
      `${data.communityId}:${day.id}:observation`,
      blank(),
    ),
    [file, setFile] = useState<File | null>(null),
    [locating, setLocating] = useState(false),
    [audioSaving, setAudioSaving] = useState(false);
  const observations = Object.values(day.observations).sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || ''),
  );
  const submitted = day.submission?.observationVersion === day.observationVersion;
  const update = <K extends keyof Observation>(key: K, value: Observation[K]) =>
    setForm((v) => ({ ...v, [key]: value }));
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await run(
      async () => {
        const audioId = form.audioId;
        await command(form.id ? 'ObservationCorrected' : 'ObservationRecorded', {
          ...form,
          dayId: day.id,
          id: form.id || crypto.randomUUID(),
          title: form.title.trim() || (audioId ? `Voice observation ${form.observedAt}` : ''),
          observedAt: new Date(form.observedAt).toISOString(),
          audioId,
          audioName: file?.name || form.audioName,
        });
        await draftSession.reset(blank());
        setFile(null);
      },
      day.closedAt
        ? 'Post-close update recorded. The day remains closed; AI is not configured.'
        : 'Observation saved locally. Submit your report when finished.',
    );
  }
  useEffect(() => {
    let active = true;
    if (form.audioId && !file)
      storage
        .getFile('community', data.communityId, form.audioId)
        .then((blob) => {
          if (active)
            setFile(new File([blob], form.audioName || 'recording.webm', { type: blob.type }));
        })
        .catch((error) => {
          if (active)
            setError(
              `Draft recording is missing: ${error.message}. Restore a backup or remove the missing attachment.`,
            );
        });
    return () => {
      active = false;
    };
  }, [form.audioId, data.communityId]);
  async function stageAudio(selected: File) {
    setAudioSaving(true);
    try {
      const audioId = await storage.putFile('community', data.communityId, selected);
      setForm((value) => ({ ...value, audioId, audioName: selected.name }));
      setFile(selected);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setAudioSaving(false);
    }
  }
  function locate() {
    if (!navigator.geolocation) return setError('Location is unavailable. Enter it manually.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        update(
          'location',
          `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)} · accuracy ±${Math.round(position.coords.accuracy)} m`,
        );
        setForm((v) => ({
          ...v,
          point: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            capturedAt: new Date(position.timestamp).toISOString(),
          },
        }));
        setLocating(false);
      },
      () => {
        setError(
          'Location not available or permission denied. Your observation can still be saved.',
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    );
  }
  return (
    <div className="feature-grid">
      <Panel className="panel">
        <h2>{form.id ? 'Correct an observation' : 'Capture an observation'}</h2>
        <p className="hint">
          Author: {data.personal.profile!.username} · {day.date}.{' '}
          {day.closedAt
            ? 'This day is closed. New evidence and corrections still appear in its timeline.'
            : 'Your own field report, saved offline.'}
        </p>
        <VoiceCapture
          disabled={busy || audioSaving}
          onError={setError}
          onCapture={(file) => void stageAudio(file)}
          onTranscript={(text) => update('notes', [form.notes, text].filter(Boolean).join('\n'))}
        />
        <DraftStatus draft={draft} />
        {audioSaving && <p role="status">Saving audio preview…</p>}
        <form onSubmit={save}>
          <fieldset className="fields" disabled={busy || audioSaving}>
            <label>
              Observation title
              <input
                aria-label="Observation title"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Optional when an audio recording is attached"
                required={!file && !form.audioId}
              />
            </label>
            <label>
              Observed at (device local time)
              <input
                aria-label="Observed at (device local time)"
                type="datetime-local"
                required
                value={form.observedAt}
                onChange={(e) => update('observedAt', e.target.value)}
              />
            </label>
            <label>
              Observation notes / transcript
              <textarea
                aria-label="Observation notes / transcript"
                rows={4}
                maxLength={30000}
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="Original audio is retained. Review dictation before saving."
              />
            </label>
            <label>
              Location
              <input
                aria-label="Location"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
              />
            </label>
            <Button type="button" disabled={locating} onClick={locate}>
              {locating ? 'Getting point location…' : 'Capture point location'}
            </Button>
            <label>
              Attach an audio recording
              <input
                aria-label="Attach an audio recording"
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) void stageAudio(selected);
                  e.target.value = '';
                }}
              />
            </label>
            {file && (
              <div>
                <p className="hint">
                  {file.name} · {(file.size / 1024).toFixed(0)} KB
                </p>
                <AudioPreview file={file} />
                <Button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setForm((value) => ({ ...value, audioId: null, audioName: null }));
                  }}
                >
                  Remove new recording
                </Button>
              </div>
            )}
            <div className="row">
              <Button className="primary">
                {form.id ? 'Save correction' : 'Save observation'}
              </Button>
              {form.id && (
                <Button
                  type="button"
                  onClick={() => {
                    void draftSession.reset(blank());
                    setFile(null);
                  }}
                >
                  Cancel correction
                </Button>
              )}
            </div>
          </fieldset>
        </form>
      </Panel>
      <section>
        <div className="section-heading">
          <h2>My field report</h2>
          <span className={`pill ${submitted ? 'positive' : ''}`}>
            {submitted ? 'Submitted' : 'Not submitted'}
          </span>
        </div>
        <p className="hint">
          {observations.length} observation{observations.length !== 1 ? 's' : ''}. Saving and
          submitting are separate actions.
        </p>
        {!observations.length && (
          <div className="empty">
            <span>◎</span>
            <h3>Record what you find</h3>
            <p>Capture audio or notes. No connection needed.</p>
          </div>
        )}
        {observations.map((observation) => (
          <article key={observation.id}>
            <h3>{observation.title}</h3>
            <p className="meta">
              Observed {new Date(observation.observedAt).toLocaleString()}
              <br />
              Recorded {new Date(observation.createdAt!).toLocaleString()}
            </p>
            {observation.location && <p className="meta">{observation.location}</p>}
            <p className="notes">{observation.notes}</p>
            <div className="row">
              <Button
                disabled={busy}
                onClick={() => {
                  setForm({ ...observation, observedAt: localTime(observation.observedAt) });
                  setFile(null);
                }}
              >
                Correct
              </Button>
              {observation.audioId && (
                <Button
                  disabled={busy}
                  onClick={() =>
                    run(async () =>
                      download(
                        observation.audioName || 'observation.webm',
                        await storage.getFile('community', data.communityId, observation.audioId!),
                      ),
                    )
                  }
                >
                  Download recording
                </Button>
              )}
            </div>
          </article>
        ))}
        <div className="panel">
          <Button
            className="primary"
            disabled={busy || submitted}
            onClick={() =>
              run(
                () =>
                  command('ReportSubmitted', {
                    dayId: day.id,
                    observationVersion: day.observationVersion,
                    nothingToAdd: observations.length === 0,
                  }),
                observations.length
                  ? 'Your report is submitted.'
                  : 'Nothing-to-add response submitted.',
              )
            }
          >
            {observations.length ? 'Submit my observations' : 'Submit — nothing to add'}
          </Button>
          <p className="hint">
            {day.closedAt
              ? 'Later corrections amend your report automatically. Previous submissions remain in the timeline.'
              : 'As the sole local participant, only your submission is required.'}
          </p>
        </div>
      </section>
    </div>
  );
}
