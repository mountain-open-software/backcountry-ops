import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { randomUUID } from 'expo-crypto';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import type { Observation, OperationalDay } from '@open-mountain/domain';
import type { ReadyWorkspace } from '../useWorkspace';
import { RecordingCapture, AudioPlayback } from '../components/Recording';
import { Button, Card, Field, Heading, Note, styles } from '../components/Controls';
function SavedAudio({ fileId, workspace }: { fileId: string; workspace: ReadyWorkspace }) {
  const [uri, setUri] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    workspace.storage
      .fileUri('community', workspace.data.communityId, fileId)
      .then((record) => {
        if (active) setUri(record.uri);
      })
      .catch((e) => {
        if (active) workspace.setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [fileId, workspace.data.communityId]);
  return (
    <View style={styles.section}>
      {uri && <AudioPlayback uri={uri} />}
      <Button
        title="Share original recording"
        onPress={() =>
          void workspace.run(() =>
            workspace.storage.shareFile('community', workspace.data.communityId, fileId),
          )
        }
      />
    </View>
  );
}
export function ObservationScreen({
  day,
  workspace,
}: {
  day: OperationalDay;
  workspace: ReadyWorkspace;
}) {
  const { data, busy, run, command, storage, setError } = workspace;
  const blank = (): Observation => ({
    id: '',
    title: '',
    notes: '',
    observedAt: new Date().toISOString(),
    location: '',
    audioId: null,
    audioName: null,
  });
  const [values, setValues] = useState<Observation>(blank),
    [audio, setAudio] = useState<{ uri: string; name: string; mime: string } | null>(null),
    [locating, setLocating] = useState(false);
  const update = <K extends keyof Observation>(key: K, value: Observation[K]) =>
    setValues((v) => ({ ...v, [key]: value }));
  async function save() {
    const ok = await run(
      async () => {
        const audioId = audio
          ? await storage.putFile('community', data.communityId, audio.uri, audio.name, audio.mime)
          : values.audioId;
        await command(values.id ? 'ObservationCorrected' : 'ObservationRecorded', {
          ...values,
          dayId: day.id,
          id: values.id || randomUUID(),
          title: values.title.trim() || (audioId ? `Voice observation ${values.observedAt}` : ''),
          audioId,
          audioName: audio?.name || values.audioName,
        });
      },
      day.closedAt
        ? 'Post-close event recorded; the day stays closed.'
        : 'Observation saved. Submit your report when done.',
    );
    if (ok) {
      setValues(blank());
      setAudio(null);
    }
  }
  async function locate() {
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted)
        throw new Error('Location denied. Save without GPS or type a location.');
      const p = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const accuracy = p.coords.accuracy;
      const location = `${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)} · ${accuracy === null ? 'accuracy unavailable' : `accuracy ±${Math.round(accuracy)} m`}`;
      setValues((value) => ({
        ...value,
        location,
        point:
          accuracy === null
            ? undefined
            : {
                latitude: p.coords.latitude,
                longitude: p.coords.longitude,
                accuracy,
                altitude: p.coords.altitude,
                altitudeAccuracy: p.coords.altitudeAccuracy,
                capturedAt: new Date(p.timestamp).toISOString(),
              },
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLocating(false);
    }
  }
  const observations = Object.values(day.observations).sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || ''),
  );
  return (
    <View style={styles.section}>
      <Card>
        <Heading>{values.id ? 'Correct observation' : 'Capture observation'}</Heading>
        <Note>
          {day.closedAt
            ? 'Day closed. Late additions/corrections appear in its timeline.'
            : 'Your own offline field report.'}{' '}
          Author: {data.personal.profile!.username}.
        </Note>
        <RecordingCapture
          disabled={busy}
          onError={setError}
          onCapture={(uri) =>
            setAudio({ uri, name: `observation-${Date.now()}.m4a`, mime: 'audio/mp4' })
          }
        />
        {audio && (
          <View style={styles.section}>
            <Note>Unsaved audio preview: {audio.name}. Save the observation to keep it.</Note>
            <AudioPlayback uri={audio.uri} />
            <Button title="Remove new recording" onPress={() => setAudio(null)} />
          </View>
        )}
        <Button
          title="Attach existing audio"
          disabled={busy}
          onPress={() =>
            void run(async () => {
              const picked = await DocumentPicker.getDocumentAsync({
                type: 'audio/*',
                copyToCacheDirectory: true,
              });
              if (!picked.canceled) {
                const file = picked.assets[0];
                setAudio({ uri: file.uri, name: file.name, mime: file.mimeType || 'audio/mp4' });
              }
            })
          }
        />
        <Field
          label="Observation title"
          value={values.title}
          onChangeText={(v) => update('title', v)}
          placeholder="Optional with audio"
        />
        <Field
          label="Observed at (ISO date/time with timezone)"
          value={values.observedAt}
          autoCapitalize="none"
          onChangeText={(v) => update('observedAt', v)}
        />
        <Field
          label="Notes / transcript"
          multiline
          value={values.notes}
          onChangeText={(v) => update('notes', v)}
        />
        <Field
          label="Location"
          value={values.location}
          onChangeText={(v) => update('location', v)}
        />
        <Button
          title={locating ? 'Getting point location…' : 'Capture point location'}
          disabled={locating || busy}
          onPress={() => void locate()}
        />
        <Button
          primary
          title={values.id ? 'Save correction' : 'Save observation'}
          disabled={busy}
          onPress={() => void save()}
        />
        {values.id && (
          <Button
            title="Cancel correction"
            onPress={() => {
              setValues(blank());
              setAudio(null);
            }}
          />
        )}
      </Card>
      <Card>
        <Heading>My field report</Heading>
        <Note>
          {day.submission?.observationVersion === day.observationVersion
            ? 'Submitted'
            : 'Not submitted'}{' '}
          · {observations.length} observations. Saving is not submission.
        </Note>
        {observations.map((o) => (
          <View key={o.id} style={[styles.card, { backgroundColor: '#f4f5ed' }]}>
            <Text style={styles.label}>{o.title}</Text>
            <Note>
              Observed {new Date(o.observedAt).toLocaleString()}
              {'\n'}Recorded {new Date(o.createdAt!).toLocaleString()}
            </Note>
            {Boolean(o.location) && <Note>{o.location}</Note>}
            <Text style={styles.note}>{o.notes}</Text>
            <Button
              title={`Correct: ${o.title}`}
              onPress={() => {
                setValues(o);
                setAudio(null);
              }}
            />
            {o.audioId && <SavedAudio fileId={o.audioId} workspace={workspace} />}
          </View>
        ))}
        <Button
          primary
          disabled={busy || day.submission?.observationVersion === day.observationVersion}
          title={observations.length ? 'Submit my observations' : 'Submit — nothing to add'}
          onPress={() =>
            void run(
              () =>
                command('ReportSubmitted', {
                  dayId: day.id,
                  observationVersion: day.observationVersion,
                  nothingToAdd: !observations.length,
                }),
              'Your own report submitted.',
            )
          }
        />
        <Note>
          After closing, corrections amend your report without reopening the day. AI is not
          configured.
        </Note>
      </Card>
    </View>
  );
}
