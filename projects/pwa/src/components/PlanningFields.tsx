import React from 'react';
import TextField from '@mui/material/TextField';
import { briefingPlans, planLabel, reorderPlans } from '@open-mountain/domain';
import { Button } from './ui';
import type { Briefing, Debrief, TripPlan } from '@open-mountain/domain';
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
type BriefingKey = 'objective' | 'triggers' | 'assessment';
export function BriefingFields({
  values,
  onChange,
  onPlansChange,
  disabled = false,
}: {
  values: Partial<Briefing>;
  onChange: (key: BriefingKey, value: string) => void;
  onPlansChange: (plans: TripPlan[]) => void;
  disabled?: boolean;
}) {
  const plans = briefingPlans(values);
  return (
    <fieldset disabled={disabled} className="fields">
      <Field
        label="Objective for the day"
        value={values.objective || ''}
        disabled={disabled}
        onChange={(v) => onChange('objective', v)}
      />
      <p className="hint">
        Plans are ordered by preference. Move a plan up or down to change its letter. Review change
        conditions when reordering.
      </p>
      {plans.map((plan, index) => {
        const label = planLabel(index);
        const edit = (key: 'description' | 'hazards', value: string) =>
          onPlansChange(plans.map((p) => (p.id === plan.id ? { ...p, [key]: value } : p)));
        return (
          <section key={plan.id} className="fields inset" aria-label={`Plan ${label}`}>
            <h3>Plan {label}</h3>
            <Field
              label={`Plan ${label} — where we go`}
              multiline
              value={plan.description}
              disabled={disabled}
              onChange={(v) => edit('description', v)}
            />
            <Field
              label={`Plan ${label} — hazards and uncertainty`}
              multiline
              value={plan.hazards}
              disabled={disabled}
              onChange={(v) => edit('hazards', v)}
            />
            <div className="row">
              <Button
                type="button"
                disabled={disabled || index === 0}
                onClick={() => onPlansChange(reorderPlans(plans, index, index - 1))}
              >
                Move plan {label} up
              </Button>
              <Button
                type="button"
                disabled={disabled || index === plans.length - 1}
                onClick={() => onPlansChange(reorderPlans(plans, index, index + 1))}
              >
                Move plan {label} down
              </Button>
              <Button
                type="button"
                disabled={disabled || plans.length === 1}
                onClick={() => onPlansChange(plans.filter((p) => p.id !== plan.id))}
              >
                Remove plan {label}
              </Button>
            </div>
          </section>
        );
      })}
      <Button
        type="button"
        disabled={disabled || plans.length >= 100}
        onClick={() =>
          onPlansChange([...plans, { id: crypto.randomUUID(), description: '', hazards: '' }])
        }
      >
        Add plan
      </Button>
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
