import { AssistantHistory } from '../components/AssistantHistory';
import { AssistantVoice } from '../components/AssistantVoice';
import React from 'react';
import type { OperationalDay, Trip } from '@open-mountain/domain';
import type { ReadyWorkspace } from '../types';
import { useAssistant } from '../useAssistant';
import { Button, Panel } from '../components/ui';
import { DraftStatus } from '../components/DraftStatus';
export function Assistant({
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
  const a = useAssistant(workspace, day, () => crypto.randomUUID(), onTripCreated);
  const proposal = a.conversation.proposal;
  return (
    <section className="assistant-workspace" aria-label="Assistant">
      <div className="assistant-heading">
        <p className="eyebrow">BACKCOUNTRY OPS · OFFLINE ASSISTANT</p>
        <h1>Tell me about your day.</h1>
        <p>
          {workspace.data.state.community?.name || 'No community selected'}
          {trip ? ` · ${trip.title}` : ''}
          {day ? ` · ${day.date}` : ''}
        </p>
      </div>
      <Panel className="panel assistant-conversation">
        <h2>Message the assistant</h2>
        <p>Write or dictate supported phrases. Review the proposed changes before saving.</p>
        {!day && (
          <p>
            Create a trip with “Create a day trip called Ridge tour on 2026-11-24”, or choose one in
            Trip data. For multiple days: “Create a trip called Traverse from 2026-11-24 to
            2026-11-26”.
          </p>
        )}
        <p role="status">
          On-device AI: {a.model.enabled ? a.model.status : 'off — downloads disabled'}
          {a.model.status === 'downloading' ? ` · ${Math.round(a.model.progress * 100)}%` : ''}
        </p>
        <AssistantHistory notes={a.notes} working={a.disabled} onUse={a.setText} />
        {a.processing && (
          <p role="status">
            Processing your note…{' '}
            {a.model.status === 'processing' ? 'On-device AI' : 'Offline phrases'}
          </p>
        )}
        {!!a.processingError && <p role="alert">{a.processingError}</p>}
        {a.model.status === 'processing' && (
          <Button type="button" onClick={a.model.controller.stop}>
            Stop local AI
          </Button>
        )}
        <div role="log" aria-label="Assistant conversation" aria-live="polite">
          {a.conversation.history.map((message, index) => (
            <article
              className={`chat-message ${message.role === 'You' ? 'from-user' : ''}`}
              key={index}
            >
              <strong>{message.role}</strong>
              <p className="notes">{message.text}</p>
            </article>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            a.process();
          }}
        >
          <label>
            Your message
            <textarea
              aria-label="Message to assistant"
              rows={5}
              maxLength={8000}
              value={a.conversation.text}
              onChange={(e) => a.setText(e.target.value)}
              disabled={a.disabled}
              placeholder="Our objective is… Observation:… Private reflection:…"
            />
          </label>
          <AssistantVoice disabled={a.disabled} onTranscript={a.appendText} />
          <DraftStatus draft={a.draft} />
          <Button className="primary" disabled={a.disabled || !a.conversation.text.trim()}>
            Process notes
          </Button>
          <p className="hint">
            Type or use your keyboard’s microphone. Offline dictation requires device and language
            support.
          </p>
        </form>
      </Panel>
      {proposal && (
        <Panel className="panel assistant-review">
          <h2>{proposal.error ? 'Clarify your notes' : 'Review proposed changes'}</h2>
          {proposal.error && <p role="alert">{proposal.error}</p>}
          {proposal.unrecognized.length > 0 && (
            <>
              <h3>Not understood</h3>
              <ul>
                {proposal.unrecognized.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
            </>
          )}
          <ul>
            {proposal.changes.map((change, i) => (
              <li key={i} className="notes">
                {change}
              </li>
            ))}
          </ul>
          {!proposal.error && (
            <>
              <p className="hint">
                Private reflections stay in your user database. Trip data is included in public
                exports. This does not approve a plan, submit a report, or close a day.
              </p>
              <Button className="primary" disabled={a.disabled} onClick={() => void a.save()}>
                Save reviewed changes
              </Button>
            </>
          )}
          <Button type="button" disabled={a.disabled} onClick={a.discard}>
            Dismiss proposal
          </Button>
        </Panel>
      )}
      <details className="panel assistant-help">
        <summary>Supported offline phrases (English)</summary>
        {a.examples.map((example, i) => (
          <div key={example}>
            <p>{example}</p>
            <Button type="button" disabled={a.disabled} onClick={() => a.setText(example)}>
              Use example {i + 1}
            </Button>
          </div>
        ))}
        <p>
          Also supported: “Mindset: Assessment”, “My hazard assessment: …”, “Add a plan: …”, “Move
          plan C before plan A”.
        </p>
        <p>
          For a debrief, include all five topics: “Expected conditions: …; Actual activity: …;
          Public human factors: …; What went well: …; Next time: …”.
        </p>
        <p>
          Use Trip data for precise form edits, recordings, routes, approvals, submissions and
          closing. No cloud AI or speech service is called by this assistant.
        </p>
        <p>
          Keyboard dictation does not provide original audio to this app. Record original audio in
          Trip data. New observations use entry time; edit it there when needed.
        </p>
        <Button type="button" onClick={onOpenData}>
          View trip data
        </Button>
      </details>
    </section>
  );
}
