import React from 'react';
import { Text, View } from 'react-native';
import { randomUUID } from 'expo-crypto';
import type { OperationalDay, Trip } from '@open-mountain/domain';
import type { ReadyWorkspace } from '../useWorkspace';
import { useAssistant } from '../useAssistant';
import { Button, Card, Field, Heading, Note, styles } from '../components/Controls';
import { DraftStatus } from '../components/DraftStatus';
export function AssistantScreen({
  workspace,
  day,
  trip,
  onTripCreated,
  onOpenData,
}: {
  workspace: ReadyWorkspace;
  day?: OperationalDay;
  trip?: Trip;
  onTripCreated: (id: string) => void;
  onOpenData: () => void;
}) {
  const a = useAssistant(workspace, day, randomUUID, onTripCreated),
    proposal = a.conversation.proposal;
  return (
    <View style={styles.section}>
      <Heading>Tell me about your day.</Heading>
      <Note>
        OFFLINE ASSISTANT · {workspace.data.state.community?.name || 'No community selected'}
        {trip ? ` · ${trip.title}` : ''}
        {day ? ` · ${day.date}` : ''}
      </Note>
      <Card>
        <Heading>Message the assistant</Heading>
        <Note>Write or dictate supported phrases. Review the proposed changes before saving.</Note>
        {!day && (
          <Note>
            Create a trip with “Create a day trip called Ridge tour on 2026-11-24”, or choose one in
            Trip data. For multiple days: “Create a trip called Traverse from 2026-11-24 to
            2026-11-26”.
          </Note>
        )}
        {a.conversation.history.map((message, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.label}>{message.role}</Text>
            <Note>{message.text}</Note>
          </View>
        ))}
        <Field
          label="Message to assistant"
          multiline
          value={a.conversation.text}
          editable={!a.disabled}
          maxLength={8000}
          onChangeText={a.setText}
        />
        <DraftStatus draft={a.draft} />
        <Button
          title="Process notes"
          primary
          disabled={a.disabled || !a.conversation.text.trim()}
          onPress={a.process}
        />
        <Note>
          Type or use your keyboard’s microphone. Offline dictation requires device and language
          support.
        </Note>
      </Card>
      {proposal && (
        <Card>
          <Heading>{proposal.error ? 'Clarify your notes' : 'Review proposed changes'}</Heading>
          {!!proposal.error && <Note>{proposal.error}</Note>}
          {proposal.unrecognized.map((text, i) => (
            <Note key={`u${i}`}>Not understood: {text}</Note>
          ))}
          {proposal.changes.map((text, i) => (
            <Note key={i}>• {text}</Note>
          ))}
          {!proposal.error && (
            <>
              <Note>
                Private reflections stay in your user database. Trip data is included in public
                exports. This does not approve a plan, submit a report, or close a day.
              </Note>
              <Button
                title="Save reviewed changes"
                primary
                disabled={a.disabled}
                onPress={() => void a.save()}
              />
            </>
          )}
          <Button title="Dismiss proposal" disabled={a.disabled} onPress={a.discard} />
        </Card>
      )}
      <Card>
        <Heading>Supported offline phrases (English)</Heading>
        {a.examples.map((example, i) => (
          <View key={example} style={styles.section}>
            <Note>{example}</Note>
            <Button
              title={`Use example ${i + 1}`}
              disabled={a.disabled}
              onPress={() => a.setText(example)}
            />
          </View>
        ))}
        <Note>
          Also: “Mindset: Assessment”, “My hazard assessment: …”, “Add a plan: …”, “Move plan C
          before plan A”.
        </Note>
        <Note>
          Debrief needs all five: “Expected conditions: …; Actual activity: …; Public human factors:
          …; What went well: …; Next time: …”.
        </Note>
        <Note>
          Keyboard dictation does not provide original audio to this app. New observations use entry
          time; edit it in Trip data. Trip data has forms, recordings, routes, approvals,
          submissions and closing. No cloud AI or speech service is called by this assistant.
        </Note>
        <Button title="View trip data" onPress={onOpenData} />
      </Card>
    </View>
  );
}
