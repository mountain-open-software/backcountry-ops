import React from 'react';
import type { Briefing, Debrief } from '@open-mountain/domain';
type BriefingKey =
  'objective' | 'planA' | 'hazardsA' | 'planB' | 'hazardsB' | 'triggers' | 'assessment';
export function BriefingFields({
  values,
  onChange,
  disabled = false,
}: {
  values: Partial<Briefing>;
  onChange: (key: BriefingKey, value: string) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="fields">
      <label>
        Objective for the day
        <input
          aria-label="Objective for the day"
          required
          maxLength={30000}
          value={values.objective || ''}
          onChange={(e) => onChange('objective', e.target.value)}
        />
      </label>
      <label>
        Plan A — where we go
        <textarea
          aria-label="Plan A — where we go"
          required
          rows={3}
          value={values.planA || ''}
          onChange={(e) => onChange('planA', e.target.value)}
        />
      </label>
      <label>
        Plan A — hazards and uncertainty
        <textarea
          aria-label="Plan A — hazards and uncertainty"
          required
          rows={3}
          value={values.hazardsA || ''}
          onChange={(e) => onChange('hazardsA', e.target.value)}
        />
      </label>
      <label>
        Plan B — alternative
        <textarea
          aria-label="Plan B — alternative"
          required
          rows={3}
          value={values.planB || ''}
          onChange={(e) => onChange('planB', e.target.value)}
        />
      </label>
      <label>
        Plan B — hazards and limits
        <textarea
          aria-label="Plan B — hazards and limits"
          required
          rows={3}
          value={values.hazardsB || ''}
          onChange={(e) => onChange('hazardsB', e.target.value)}
        />
      </label>
      <label>
        Conditions that trigger a change
        <textarea
          aria-label="Conditions that trigger a change"
          required
          rows={3}
          value={values.triggers || ''}
          onChange={(e) => onChange('triggers', e.target.value)}
        />
      </label>
      <label>
        My hazard assessment and rationale
        <textarea
          aria-label="My hazard assessment and rationale"
          required
          rows={3}
          value={values.assessment || ''}
          onChange={(e) => onChange('assessment', e.target.value)}
        />
      </label>
    </fieldset>
  );
}
export function DebriefFields({
  values,
  onChange,
  disabled = false,
}: {
  values: Debrief;
  onChange: (key: keyof Debrief, value: string) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="fields">
      <label>
        Expected versus observed conditions
        <textarea
          aria-label="Expected versus observed conditions"
          required
          rows={3}
          value={values.expected}
          onChange={(e) => onChange('expected', e.target.value)}
        />
      </label>
      <label>
        Planned versus actual activity
        <textarea
          aria-label="Planned versus actual activity"
          required
          rows={3}
          value={values.actual}
          onChange={(e) => onChange('actual', e.target.value)}
        />
      </label>
      <label>
        Human factors discussed (public notes)
        <textarea
          aria-label="Human factors discussed (public notes)"
          required
          rows={3}
          value={values.humanFactors}
          onChange={(e) => onChange('humanFactors', e.target.value)}
        />
      </label>
      <label>
        What went well
        <textarea
          aria-label="What went well"
          required
          rows={3}
          value={values.good}
          onChange={(e) => onChange('good', e.target.value)}
        />
      </label>
      <label>
        What needs to change
        <textarea
          aria-label="What needs to change"
          required
          rows={3}
          value={values.change}
          onChange={(e) => onChange('change', e.target.value)}
        />
      </label>
    </fieldset>
  );
}
