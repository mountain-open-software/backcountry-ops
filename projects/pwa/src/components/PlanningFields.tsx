import React from 'react';
import TextField from '@mui/material/TextField';
import type { Briefing, Debrief } from '@open-mountain/domain';
function Field({
  label,
  value,
  onChange,
  multiline = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  disabled?: boolean;
}) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      label={label}
      value={value}
      required
      multiline={multiline}
      minRows={multiline ? 3 : undefined}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      slotProps={{ htmlInput: { 'aria-label': label, maxLength: 30000 } }}
    />
  );
}
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
      <Field
        label="Objective for the day"
        value={values.objective || ''}
        disabled={disabled}
        onChange={(v) => onChange('objective', v)}
      />
      <Field
        label="Plan A — where we go"
        multiline
        value={values.planA || ''}
        disabled={disabled}
        onChange={(v) => onChange('planA', v)}
      />
      <Field
        label="Plan A — hazards and uncertainty"
        multiline
        value={values.hazardsA || ''}
        disabled={disabled}
        onChange={(v) => onChange('hazardsA', v)}
      />
      <Field
        label="Plan B — alternative"
        multiline
        value={values.planB || ''}
        disabled={disabled}
        onChange={(v) => onChange('planB', v)}
      />
      <Field
        label="Plan B — hazards and limits"
        multiline
        value={values.hazardsB || ''}
        disabled={disabled}
        onChange={(v) => onChange('hazardsB', v)}
      />
      <Field
        label="Conditions that trigger a change"
        multiline
        value={values.triggers || ''}
        disabled={disabled}
        onChange={(v) => onChange('triggers', v)}
      />
      <Field
        label="My hazard assessment and rationale"
        multiline
        value={values.assessment || ''}
        disabled={disabled}
        onChange={(v) => onChange('assessment', v)}
      />
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
      <Field
        label="Expected versus observed conditions"
        multiline
        value={values.expected}
        disabled={disabled}
        onChange={(v) => onChange('expected', v)}
      />
      <Field
        label="Planned versus actual activity"
        multiline
        value={values.actual}
        disabled={disabled}
        onChange={(v) => onChange('actual', v)}
      />
      <Field
        label="Human factors discussed (public notes)"
        multiline
        value={values.humanFactors}
        disabled={disabled}
        onChange={(v) => onChange('humanFactors', v)}
      />
      <Field
        label="What went well"
        multiline
        value={values.good}
        disabled={disabled}
        onChange={(v) => onChange('good', v)}
      />
      <Field
        label="What needs to change"
        multiline
        value={values.change}
        disabled={disabled}
        onChange={(v) => onChange('change', v)}
      />
    </fieldset>
  );
}
