import { DailyNavigation } from './components/DailyNavigation';
import { PaperProvider } from 'react-native-paper';
import { type DailyScreen, tokens } from '@open-mountain/design-system';
import { nativeTheme } from './theme';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { randomUUID } from 'expo-crypto';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useWorkspace, type ReadyWorkspace } from './useWorkspace';
import { Button, Card, Field, Heading, Note, styles, colors } from './components/Controls';
import { BriefingScreen } from './features/BriefingScreen';
import { ObservationScreen } from './features/ObservationScreen';
import { DebriefScreen } from './features/DebriefScreen';
import { TimelineScreen } from './features/TimelineScreen';
import { RouteScreen } from './features/RouteScreen';
import { SettingsScreen } from './features/SettingsScreen';
import { shareJSON } from './nativeStorage';
const today = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
function WorkspaceApp() {
  const workspace = useWorkspace();
  const { data, loading, busy, error, message, run, createProfile, command, refresh, storage } =
    workspace;
  const [username, setUsername] = useState(''),
    [community, setCommunity] = useState('My mountain community');
  const [tripName, setTripName] = useState(''),
    [start, setStart] = useState(today),
    [end, setEnd] = useState(today),
    [showCreate, setShowCreate] = useState(false);
  const [tripId, setTripId] = useState(''),
    [dayId, setDayId] = useState(''),
    [tab, setTab] = useState<DailyScreen>('briefing'),
    [settings, setSettings] = useState(false),
    [moveTarget, setMoveTarget] = useState('');
  const { width } = useWindowDimensions();
  const trips = Object.values(data?.state.trips || {}).filter((t) => !t.movedTo),
    trip = trips.find((t) => t.id === tripId) || trips[0];
  const days = Object.values(data?.state.days || {})
      .filter((d) => d.tripId === trip?.id)
      .sort((a, b) => a.date.localeCompare(b.date)),
    day = days.find((d) => d.id === dayId) || days[0];
  const ready = { ...workspace, data: data! } as ReadyWorkspace;
  async function createTrip() {
    const id = randomUUID();
    const ok = await run(
      () =>
        command('TripCreated', {
          id,
          title: tripName.trim(),
          startDate: start,
          endDate: end,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        }),
      'Trip created with one day per date.',
    );
    if (ok) {
      setTripId(id);
      setDayId('');
      setTripName('');
      setShowCreate(false);
    }
  }
  const body = loading ? (
    <Note>Opening your local only workspace…</Note>
  ) : !data ? (
    <View style={styles.section}>
      <Text style={local.hero}>Your next day{`\n`}starts here.</Text>
      <Card>
        <Heading>Set up your local profile</Heading>
        <Note>Solo operation, on this device. No server or password required.</Note>
        <Field
          label="Your username"
          value={username}
          onChangeText={setUsername}
          maxLength={80}
          autoCapitalize="none"
        />
        <Field label="Local community name" value={community} onChangeText={setCommunity} />
        <Button
          title="Create my workspace"
          primary
          disabled={busy}
          onPress={() =>
            void run(
              () => createProfile(username.trim(), community.trim()),
              'Your native workspace is ready.',
            )
          }
        />
        <Button
          title="Restore a local backup"
          disabled={busy}
          onPress={() =>
            void run(async () => {
              const picked = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
              });
              if (picked.canceled) return;
              const file = new File(picked.assets[0].uri);
              if (file.size > 100 * 1024 * 1024) throw new Error('Backup must be at most 100 MB');
              await storage.restoreBackup(JSON.parse(await file.text()));
            }, 'Backup restored.')
          }
        />
      </Card>
    </View>
  ) : (
    <View style={styles.section}>
      <Text style={local.hero}>Make a plan.{`\n`}Keep a field record.</Text>
      <Note>{data.personal.profile!.username} · Solo · local only</Note>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={local.chips}
      >
        {data.personal.communities.map((c) => (
          <Button
            key={c.id}
            title={c.name}
            primary={data.communityId === c.id}
            disabled={busy}
            onPress={() => {
              setTripId('');
              setDayId('');
              void run(() => refresh(c.id));
            }}
          />
        ))}
      </ScrollView>
      <View style={width >= 900 ? local.wide : styles.section}>
        <View style={width >= 900 ? local.sidebar : undefined}>
          <Card>
            <Heading>My trips</Heading>
            {trips.map((t) => (
              <Button
                key={t.id}
                title={`${t.title} · ${t.startDate}`}
                primary={trip?.id === t.id}
                disabled={busy}
                onPress={() => {
                  setTripId(t.id);
                  setDayId('');
                  setMoveTarget('');
                }}
              />
            ))}
            <Button
              title={showCreate ? 'Hide trip form' : 'Plan a trip'}
              disabled={busy}
              onPress={() => setShowCreate(!showCreate)}
            />
            {(showCreate || !trips.length) && (
              <View style={styles.section}>
                <Field label="Trip name" value={tripName} onChangeText={setTripName} />
                <Field
                  label="Start date (YYYY-MM-DD)"
                  value={start}
                  onChangeText={(v) => {
                    setStart(v);
                    if (v > end) setEnd(v);
                  }}
                  autoCapitalize="none"
                />
                <Field
                  label="End date (YYYY-MM-DD)"
                  value={end}
                  onChangeText={setEnd}
                  autoCapitalize="none"
                />
                <Note>Same date for a day trip; up to 90 days for an expedition.</Note>
                <Button
                  title="Create trip"
                  primary
                  disabled={busy}
                  onPress={() => void createTrip()}
                />
              </View>
            )}
          </Card>
        </View>
        <View style={width >= 900 ? local.content : styles.section}>
          {!day ? (
            <Card>
              <Heading>Room for your next adventure</Heading>
              <Note>
                Create your first trip to begin. All data stays local until you explicitly export
                it.
              </Note>
            </Card>
          ) : (
            <View style={styles.section}>
              <Heading>{trip.title}</Heading>
              <Note>
                {trip.timeZone} ·{' '}
                {day.closedAt ? 'Closed · later observations allowed' : 'Operational day'} · sole
                participant / leader
              </Note>
              <ScrollView horizontal contentContainerStyle={local.chips}>
                {days.map((d) => (
                  <Button
                    key={d.id}
                    title={`${d.date}${d.closedAt ? ' · Closed' : ''}`}
                    primary={d.id === day.id}
                    disabled={busy}
                    onPress={() => setDayId(d.id)}
                  />
                ))}
              </ScrollView>
              <DailyNavigation active={tab} busy={busy} onChange={setTab} />
              {tab === 'briefing' && (
                <BriefingScreen
                  key={`${day.id}-${day.briefing?.version || 0}`}
                  day={day}
                  workspace={ready}
                />
              )}
              {tab === 'observations' && (
                <ObservationScreen key={day.id} day={day} workspace={ready} />
              )}
              {tab === 'debrief' && <DebriefScreen key={day.id} day={day} workspace={ready} />}
              {tab === 'timeline' && <TimelineScreen day={day} workspace={ready} />}
              {tab === 'routes' && <RouteScreen key={day.id} day={day} workspace={ready} />}
              {tab === 'routes' && (
                <Card>
                  <Heading>Portable field records</Heading>
                  <Button
                    title="Export day — public data only"
                    onPress={() =>
                      void run(() =>
                        shareJSON(`backcountry-ops-${day.date}.json`, {
                          version: 2,
                          trip,
                          day,
                          events: data.events.filter((e) => e.payload.dayId === day.id),
                        }),
                      )
                    }
                  />
                  <Note>
                    Private reflections and attachment bytes are excluded. Use full backup for
                    complete recovery.
                  </Note>
                  {trip.startDate === trip.endDate && (
                    <View style={styles.section}>
                      <Note>
                        Move this day into an expedition (extends its dates when needed). Date
                        conflicts: Merge — Coming soon.
                      </Note>
                      {trips
                        .filter((t) => t.id !== trip.id && t.startDate !== t.endDate)
                        .map((t) => (
                          <Button
                            key={t.id}
                            title={t.title}
                            primary={moveTarget === t.id}
                            onPress={() => setMoveTarget(t.id)}
                          />
                        ))}
                      <Button
                        title="Confirm day-trip move"
                        disabled={!moveTarget || busy}
                        onPress={() =>
                          Alert.alert(
                            'Move day trip?',
                            'Move its day and history into the destination, extending its date range if needed. Existing date conflicts are not merged.',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Move',
                                onPress: () =>
                                  void run(async () => {
                                    await command('TripMoved', {
                                      sourceId: trip.id,
                                      targetId: moveTarget,
                                      confirmed: true,
                                    });
                                    setTripId(moveTarget);
                                    setDayId(day.id);
                                  }, 'Day trip moved.'),
                              },
                            ],
                          )
                        }
                      />
                    </View>
                  )}
                </Card>
              )}
            </View>
          )}
        </View>
      </View>
      <Button
        title={settings ? 'Hide profile & backups' : 'Profile & local backups'}
        onPress={() => setSettings(!settings)}
      />
      {settings && <SettingsScreen key={data.userId} workspace={ready} />}
    </View>
  );
  return (
    <SafeAreaView style={local.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={local.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={local.page}>
          <View style={local.header}>
            <Text style={local.brand}>△ BACKCOUNTRY OPS</Text>
            <Text style={styles.small}>Solo · local only</Text>
          </View>
          {Boolean(error) && (
            <View accessibilityRole="alert" style={local.error}>
              <Text style={{ color: tokens.color.error }}>{error}</Text>
            </View>
          )}
          {Boolean(message) && (
            <View accessibilityLiveRegion="polite" style={local.notice}>
              <Text style={{ color: colors.green }}>{message}</Text>
            </View>
          )}
          {body}
          <Note>No API · No sync · AI not configured</Note>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={nativeTheme}>
        <WorkspaceApp />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
const local = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  page: { padding: 18, gap: 22, width: '100%', maxWidth: 1300, alignSelf: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  brand: { fontSize: 16, letterSpacing: 1, fontWeight: '800', color: colors.green },
  hero: { fontSize: 38, fontWeight: '500', lineHeight: 44, color: colors.green, marginTop: 10 },
  chips: { gap: 9, paddingVertical: 4 },
  wide: { flexDirection: 'row', gap: 22, alignItems: 'flex-start' },
  sidebar: { width: 280 },
  content: { flex: 1, gap: 20 },
  error: { padding: 16, borderRadius: 10, backgroundColor: tokens.color.errorContainer },
  notice: { padding: 16, borderRadius: 10, backgroundColor: tokens.color.primaryContainer },
});
