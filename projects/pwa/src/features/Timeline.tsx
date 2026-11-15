import { Panel } from '../components/ui';
import type { DomainEvent, Trip, OperationalDay } from '@open-mountain/domain';
import React from 'react';
const labels: Record<string, string> = {
  TripCreated: 'Trip created',
  BriefingSaved: 'Briefing revised',
  PlanApproved: 'Plan approved',
  FieldDecisionRecorded: 'Field decision',
  ObservationRecorded: 'Observation recorded',
  ObservationCorrected: 'Observation corrected',
  ReportSubmitted: 'My report submitted',
  DebriefSaved: 'Debrief completed',
  DayClosed: 'Day closed',
  RouteAttached: 'Route / track attached',
  TripMoved: 'Day trip moved',
};
export function Timeline({
  day,
  events,
  trip,
  username,
}: {
  day: OperationalDay;
  events: DomainEvent[];
  trip: Trip;
  username: string;
}) {
  const relevant = events.filter(
    (e) =>
      e.payload.dayId === day.id ||
      (e.type === 'TripCreated' && e.payload.id === trip.id) ||
      (e.type === 'TripMoved' &&
        (e.payload.sourceId === trip.id || e.payload.targetId === trip.id)),
  );
  const closingIndex = relevant.findIndex((e) => e.type === 'DayClosed');
  return (
    <Panel className="panel timeline-panel">
      <h2>Day timeline</h2>
      <p className="hint">
        Recorded order is preserved. Observation time is separate from entry/correction time.
        Personal human-factor notes stay in your user database.
      </p>
      {!relevant.length && <p>No recorded events.</p>}
      <ol className="timeline">
        {relevant.map((event, index) => (
          <li key={event.id}>
            <div className="timeline-dot" />
            <div>
              <div className="section-heading">
                <h3>{labels[event.type] || event.type}</h3>
                {closingIndex >= 0 && index > closingIndex && (
                  <span className="pill">After day close</span>
                )}
              </div>
              <p className="meta">
                {new Date(event.recordedAt).toLocaleString()} · {username}
              </p>
              {event.payload.title && <p>{event.payload.title}</p>}
              {event.type === 'FieldDecisionRecorded' && (
                <p>
                  {event.payload.action} · {event.payload.rationale}
                  <br />
                  <small>
                    {event.payload.authority === 'within'
                      ? 'Leader approval within agreed plan'
                      : 'Explicit solo departure approval'}
                  </small>
                </p>
              )}
              {event.payload.observedAt && (
                <p className="hint">
                  Observed {new Date(event.payload.observedAt).toLocaleString()}
                </p>
              )}
              <details>
                <summary>Event detail</summary>
                <pre>{JSON.stringify(event, null, 2)}</pre>
              </details>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
