import { useDraft } from '../useDraft';
import { DraftStatus } from '../components/DraftStatus';
import { Button, Panel } from '../components/ui';
import type { DayProps } from '../types';
import React, { useState } from 'react';
import { blankDebrief } from '@open-mountain/domain';
import { DebriefFields } from '../components/PlanningFields';
export function Debrief({ day, workspace }: DayProps) {
  const { data, storage, busy, run, command } = workspace;
  const [values, setValues, draft, draftSession] = useDraft(
    storage,
    data.userId,
    `${data.communityId}:${day.id}:debrief:${day.debrief?.completedAt || 'new'}`,
    day.debrief || blankDebrief,
  );
  const ready = day.debrief && day.submission?.observationVersion === day.observationVersion;
  return (
    <div className="feature-grid">
      <Panel className="panel">
        <h2>Reflect on the day</h2>
        <DraftStatus draft={draft} />
        <p className="hint">
          Your personal debrief. Record what you learned; write “not discussed” or “unknown” where
          appropriate. Put sensitive personal reflections in your private notes, not this public
          record.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              await command('DebriefSaved', { ...values, dayId: day.id });
              await draftSession.clear();
            }, 'Debrief completed. Closing remains a separate leader action.');
          }}
        >
          <DebriefFields
            disabled={busy || Boolean(day.closedAt)}
            values={values}
            onChange={(key, value) => setValues({ ...values, [key]: value })}
          />
          <Button className="primary" disabled={busy || Boolean(day.closedAt)}>
            Complete my debrief
          </Button>
        </form>
      </Panel>
      <div className="stack">
        <Panel className="panel">
          <h2>Close the day</h2>
          <ul className="checklist">
            <li>
              {day.submission?.observationVersion === day.observationVersion ? '✓' : '○'} My current
              observations submitted
            </li>
            <li>{day.debrief ? '✓' : '○'} My debrief completed</li>
            <li>{day.closedAt ? '✓' : '○'} Explicit local leader confirmation</li>
          </ul>
          <Button
            className="primary"
            disabled={busy || !ready || Boolean(day.closedAt)}
            onClick={() =>
              run(
                () => command('DayClosed', { dayId: day.id }),
                'Day closed. You can still add or correct observations.',
              )
            }
          >
            {day.closedAt ? 'Day is closed' : 'Confirm day closing'}
          </Button>
          {day.closedAt && (
            <p className="hint">
              Closed {new Date(day.closedAt).toLocaleString()}. Subsequent observation events do not
              reopen it.
            </p>
          )}
        </Panel>
        <Panel className="panel">
          <p className="eyebrow">AI NOT CONFIGURED</p>
          <h2>Closing summary</h2>
          <p>
            No server is connected. Your reports and debrief are preserved locally; an unavailable
            AI summary never blocks closing.
          </p>
          <p className="hint">
            Future server summaries will keep approved and revised versions, with leader approval.
            Post-close edits will be identified explicitly.
          </p>
        </Panel>
      </div>
    </div>
  );
}
