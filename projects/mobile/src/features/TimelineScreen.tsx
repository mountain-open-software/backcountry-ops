import React from 'react';
import { Text, View, Alert } from 'react-native';
import type { OperationalDay } from '@open-mountain/domain';
import type { ReadyWorkspace } from '../useWorkspace';
import { Button, Card, Heading, Note, styles } from '../components/Controls';
export function TimelineScreen({
  day,
  workspace,
}: {
  day: OperationalDay;
  workspace: ReadyWorkspace;
}) {
  const events = workspace.data.events.filter(
    (e) =>
      e.payload.dayId === day.id ||
      (e.type === 'TripCreated' && e.payload.id === day.tripId) ||
      (e.type === 'TripMoved' && e.payload.targetId === day.tripId),
  );
  const closing = events.findIndex((e) => e.type === 'DayClosed');
  return (
    <Card>
      <Heading>Day timeline</Heading>
      <Note>
        Recorded event order. Observation time is shown separately. Private reflections are
        excluded.
      </Note>
      {events.map((e, index) => (
        <View key={e.id} style={[styles.card, { backgroundColor: '#f1f3ea' }]}>
          <Text style={styles.label}>
            {e.type.replace(/([a-z])([A-Z])/g, '$1 $2')}
            {closing >= 0 && index > closing ? ' · After day close' : ''}
          </Text>
          <Note>
            {new Date(e.recordedAt).toLocaleString()} · {workspace.data.personal.profile!.username}
          </Note>
          {e.payload.title && <Note>{e.payload.title}</Note>}
          {e.payload.observedAt && (
            <Note>Observed {new Date(e.payload.observedAt).toLocaleString()}</Note>
          )}
          <Button
            title="View event detail"
            onPress={() => Alert.alert('Recorded event', JSON.stringify(e, null, 2))}
          />
        </View>
      ))}
    </Card>
  );
}
