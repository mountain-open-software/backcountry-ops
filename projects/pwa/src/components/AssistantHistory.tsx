import React, { useState } from 'react';
import type { AssistantNote } from '@open-mountain/domain';
import { Button } from './ui';
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
    <section aria-label="All assistant note history">
      <h3>All note history ({notes.length})</h3>
      {!notes.length && (
        <p className="hint">
          Processed notes and their status will appear here. Notes are private to your profile.
        </p>
      )}
      {notes.length > count && (
        <Button type="button" onClick={() => setCount((v) => v + 20)}>
          Show earlier notes ({notes.length - count} remaining)
        </Button>
      )}
      {notes.slice(-count).map((note) => (
        <article key={note.id}>
          <p className="meta">
            {note.context} · {new Date(note.createdAt).toLocaleString()}
          </p>
          <p className="notes">{note.text}</p>
          <p role="status">
            Status:{' '}
            {!working && ['processing', 'saving'].includes(note.status)
              ? 'Interrupted — note retained'
              : note.status}
            {note.engine
              ? ` · ${note.engine === 'local-model' ? 'On-device AI' : 'Offline phrases'}`
              : ''}
          </p>
          {!!note.response && <p className="notes">{note.response}</p>}
          <details>
            <summary>Processing timeline</summary>
            {note.transitions.map((change, i) => (
              <p className="meta" key={i}>
                {change.status} · {new Date(change.at).toLocaleString()}
              </p>
            ))}
          </details>
          <Button type="button" disabled={working} onClick={() => onUse(note.text)}>
            Use this note
          </Button>
        </article>
      ))}
    </section>
  );
}
