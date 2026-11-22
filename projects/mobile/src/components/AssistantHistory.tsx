import React, { useState } from 'react';
import { View } from 'react-native';
import type { AssistantNote } from '@open-mountain/domain';
import { Button, Heading, Note, styles } from './Controls';
export function AssistantHistory({
  notes,
  working,
  onUse,
}: {
  notes: AssistantNote[];
  working: boolean;
  onUse: (text: string) => void;
}) {
  const [count, setCount] = useState(20);
  return (
    <View style={styles.section}>
      <Heading>All note history ({notes.length})</Heading>
      {!notes.length && (
        <Note>Processed notes and status appear here. Notes are private to your profile.</Note>
      )}
      {notes.length > count && (
        <Button
          title={`Show earlier notes (${notes.length - count} remaining)`}
          onPress={() => setCount((v) => v + 20)}
        />
      )}
      {notes.slice(-count).map((note) => (
        <View key={note.id} style={styles.card}>
          <Note>
            {note.context} · {new Date(note.createdAt).toLocaleString()}
          </Note>
          <Note>{note.text}</Note>
          <Note>
            Status:{' '}
            {!working && ['processing', 'saving'].includes(note.status)
              ? 'Interrupted — note retained'
              : note.status}
            {note.engine
              ? ` · ${note.engine === 'local-model' ? 'On-device AI' : 'Offline phrases'}`
              : ''}
          </Note>
          {!!note.response && <Note>{note.response}</Note>}
          <Note>{note.transitions.map((t) => t.status).join(' → ')}</Note>
          <Button title="Use this note" disabled={working} onPress={() => onUse(note.text)} />
        </View>
      ))}
    </View>
  );
}
