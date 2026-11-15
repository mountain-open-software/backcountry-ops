import { useDraft } from '../useDraft';
import { DraftStatus } from '../components/DraftStatus';
import React, { useState } from 'react';
import { View } from 'react-native';
import { blankDebrief, type Debrief, type OperationalDay } from '@open-mountain/domain';
import type { ReadyWorkspace } from '../useWorkspace';
import { Button, Card, Field, Heading, Note, styles } from '../components/Controls';
export function DebriefScreen({
  day,
  workspace,
}: {
  day: OperationalDay;
  workspace: ReadyWorkspace;
}) {
  const { data, storage, busy, run, command } = workspace;
  const [values, setValues, draft, draftSession] = useDraft<Debrief>(
    storage,
    data.userId,
    `${data.communityId}:${day.id}:debrief:${day.debrief?.completedAt || 'new'}`,
    day.debrief || blankDebrief,
  );
  const update = (key: keyof Debrief, value: string) => setValues((v) => ({ ...v, [key]: value }));
  const submitted = day.submission?.observationVersion === day.observationVersion;
  return (
    <View style={styles.section}>
      <Card>
        <Heading>Reflect on the day</Heading>
        <DraftStatus draft={draft} />
        <Note>
          Personal debrief. Write unknown/not discussed where appropriate. Keep private human-factor
          notes in your user database.
        </Note>
        <Field
          label="Expected versus observed conditions"
          multiline
          value={values.expected}
          editable={!day.closedAt}
          onChangeText={(v) => update('expected', v)}
        />
        <Field
          label="Planned versus actual activity"
          multiline
          value={values.actual}
          editable={!day.closedAt}
          onChangeText={(v) => update('actual', v)}
        />
        <Field
          label="Human factors discussed (public notes)"
          multiline
          value={values.humanFactors}
          editable={!day.closedAt}
          onChangeText={(v) => update('humanFactors', v)}
        />
        <Field
          label="What went well"
          multiline
          value={values.good}
          editable={!day.closedAt}
          onChangeText={(v) => update('good', v)}
        />
        <Field
          label="What needs to change"
          multiline
          value={values.change}
          editable={!day.closedAt}
          onChangeText={(v) => update('change', v)}
        />
        <Button
          title="Complete my debrief"
          primary
          disabled={busy || Boolean(day.closedAt)}
          onPress={() =>
            void run(async () => {
              await command('DebriefSaved', { ...values, dayId: day.id });
              await draftSession.clear();
            }, 'Debrief done. Closing requires your separate confirmation.')
          }
        />
      </Card>
      <Card>
        <Heading>Close the day</Heading>
        <Note>
          {submitted ? '✓' : '○'} Current observations submitted{'\n'}
          {day.debrief ? '✓' : '○'} Debrief complete{'\n'}
          {day.closedAt ? '✓' : '○'} Explicit leader closing
        </Note>
        <Button
          title={day.closedAt ? 'Day is closed' : 'Confirm day closing'}
          primary
          disabled={busy || !submitted || !day.debrief || Boolean(day.closedAt)}
          onPress={() =>
            void run(
              () => command('DayClosed', { dayId: day.id }),
              'Day closed. Later observation events do not reopen it.',
            )
          }
        />
        {day.closedAt && <Note>Closed {new Date(day.closedAt).toLocaleString()}</Note>}
        <Note>
          AI not configured. No summary is generated; that does not block offline closing.
        </Note>
      </Card>
      <Card>
        <Heading>Closing summary</Heading>
        <Note>
          No server is connected. Reports and debrief remain local; an unavailable AI summary never
          blocks closing.
        </Note>
        <Note>
          Future server summaries will preserve approved and revised versions with leader approval.
          Post-close edits will be identified explicitly.
        </Note>
      </Card>
    </View>
  );
}
