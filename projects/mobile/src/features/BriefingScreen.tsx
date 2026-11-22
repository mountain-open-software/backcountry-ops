import { randomUUID } from 'expo-crypto';
import { useDraft } from '../useDraft';
import { DraftStatus } from '../components/DraftStatus';
import { tokens } from '@open-mountain/design-system';
import React, { useState } from 'react';
import { View, Text, Switch } from 'react-native';
import {
  briefingPlans,
  planLabel,
  reorderPlans,
  mindsets,
  problemTypes,
  type Briefing,
  type FieldDecision,
  type OperationalDay,
} from '@open-mountain/domain';
import type { ReadyWorkspace } from '../useWorkspace';
import { Button, Card, Field, Heading, Note, styles, colors } from '../components/Controls';
const initial: Briefing = {
  objective: '',
  plans: [{ id: 'initial-plan-a', description: '', hazards: '' }],
  triggers: '',
  assessment: '',
  mindset: 'Assessment',
  problems: [],
};
export function BriefingScreen({
  day,
  workspace,
}: {
  day: OperationalDay;
  workspace: ReadyWorkspace;
}) {
  const { data, busy, run, command, personalCommand, storage } = workspace;
  const [values, setValues, briefingDraft, briefingSession] = useDraft<Briefing>(
      storage,
      data.userId,
      `${data.communityId}:${day.id}:briefing:${day.briefing?.version || 0}`,
      day.briefing || initial,
    ),
    [reflection, setReflection, reflectionDraft, reflectionSession] = useDraft(
      storage,
      data.userId,
      `${data.communityId}:${day.id}:reflection`,
      data.personal.reflections[`${data.communityId}:${day.id}`]?.text || '',
    );
  const [decision, setDecision, decisionDraft, decisionSession] = useDraft<FieldDecision>(
    storage,
    data.userId,
    `${data.communityId}:${day.id}:decision:${day.briefing?.version || 0}`,
    {
      dayId: day.id,
      authority: 'within',
      action: '',
      rationale: '',
      trigger: '',
      soloApproval: false,
    },
  );
  const approved = Boolean(
      day.approval && day.briefing && day.approval.planVersion === day.briefing.version,
    ),
    closed = Boolean(day.closedAt);
  const update = <K extends keyof Briefing>(key: K, value: Briefing[K]) =>
    setValues((v) => ({ ...v, [key]: value }));
  const plans = briefingPlans(values);
  return (
    <View style={styles.section}>
      <Card>
        <Heading>Morning briefing</Heading>
        <DraftStatus draft={briefingDraft} />
        <Note>
          {approved ? 'Plan approved' : 'Draft / review needed'} · Your own solo assessment. No
          other person’s approval is implied.
        </Note>
        <Text style={styles.label}>Strategic mindset: {values.mindset}</Text>
        <View style={styles.row}>
          {mindsets
            .filter((m) => m !== 'Maintenance')
            .map((m) => (
              <Button
                key={m}
                title={m}
                disabled={busy || closed}
                primary={m === values.mindset}
                onPress={() => update('mindset', m)}
              />
            ))}
        </View>
        <Field
          label="Objective for the day"
          value={values.objective}
          editable={!busy && !closed}
          onChangeText={(v) => update('objective', v)}
        />
        <Note>
          Plans are ordered by preference. Move a plan up or down to change its letter. Review
          change conditions when reordering.
        </Note>
        {plans.map((plan, index) => {
          const label = planLabel(index);
          const edit = (key: 'description' | 'hazards', value: string) =>
            update(
              'plans',
              plans.map((p) => (p.id === plan.id ? { ...p, [key]: value } : p)),
            );
          return (
            <View key={plan.id} style={styles.card}>
              <Heading>Plan {label}</Heading>
              <Field
                label={`Plan ${label} — where we go`}
                multiline
                value={plan.description}
                editable={!busy && !closed}
                onChangeText={(v) => edit('description', v)}
              />
              <Field
                label={`Plan ${label} — hazards and uncertainty`}
                multiline
                value={plan.hazards}
                editable={!busy && !closed}
                onChangeText={(v) => edit('hazards', v)}
              />
              <Button
                title={`Move plan ${label} up`}
                disabled={busy || closed || index === 0}
                onPress={() => update('plans', reorderPlans(plans, index, index - 1))}
              />
              <Button
                title={`Move plan ${label} down`}
                disabled={busy || closed || index === plans.length - 1}
                onPress={() => update('plans', reorderPlans(plans, index, index + 1))}
              />
              <Button
                title={`Remove plan ${label}`}
                disabled={busy || closed || plans.length === 1}
                onPress={() =>
                  update(
                    'plans',
                    plans.filter((p) => p.id !== plan.id),
                  )
                }
              />
            </View>
          );
        })}
        <Button
          title="Add plan"
          disabled={busy || closed || plans.length >= 100}
          onPress={() =>
            update('plans', [...plans, { id: randomUUID(), description: '', hazards: '' }])
          }
        />
        <Field
          label="Conditions that trigger a change"
          multiline
          value={values.triggers}
          editable={!busy && !closed}
          onChangeText={(v) => update('triggers', v)}
        />
        <Field
          label="My hazard assessment and rationale"
          multiline
          value={values.assessment}
          editable={!busy && !closed}
          onChangeText={(v) => update('assessment', v)}
        />
        <Heading>Avalanche problems</Heading>
        <Note>
          Type, terrain location, likelihood in your words, and destructive size. Unknown does not
          mean low risk.
        </Note>
        {values.problems.map((problem, index) => (
          <View key={index} style={[styles.card, { backgroundColor: tokens.color.surfaceVariant }]}>
            <Text style={styles.label}>
              Problem {index + 1}: {problem.type}
            </Text>
            <View style={styles.row}>
              {problemTypes.map((type) => (
                <Button
                  key={type}
                  title={type}
                  disabled={busy || closed}
                  primary={problem.type === type}
                  onPress={() =>
                    update(
                      'problems',
                      values.problems.map((p, i) => (i === index ? { ...p, type } : p)),
                    )
                  }
                />
              ))}
            </View>
            {(
              [
                ['terrain', 'Elevation, aspects, terrain'],
                ['likelihood', 'Likelihood and trigger'],
                ['evidence', 'Evidence and uncertainty'],
                ['minSize', 'Minimum size (1–5 or blank)'],
                ['maxSize', 'Maximum size (1–5 or blank)'],
              ] as const
            ).map(([key, label]) => (
              <Field
                key={key}
                label={label}
                value={problem[key]}
                editable={!busy && !closed}
                onChangeText={(v) =>
                  update(
                    'problems',
                    values.problems.map((p, i) => (i === index ? { ...p, [key]: v } : p)),
                  )
                }
              />
            ))}
            <Button
              title="Remove problem"
              disabled={busy || closed}
              onPress={() =>
                update(
                  'problems',
                  values.problems.filter((_, i) => i !== index),
                )
              }
            />
          </View>
        ))}
        <Button
          title="Add avalanche problem"
          disabled={busy || closed}
          onPress={() =>
            update('problems', [
              ...values.problems,
              {
                type: 'Wind Slab',
                terrain: '',
                likelihood: '',
                evidence: '',
                minSize: '',
                maxSize: '',
              },
            ])
          }
        />
        <Button
          title="Save briefing draft"
          primary
          disabled={busy || closed}
          onPress={() =>
            void run(async () => {
              await command('BriefingSaved', { ...values, plans, dayId: day.id });
              await briefingSession.clear();
            }, 'Briefing saved. Review and approve this version.')
          }
        />
        <Button
          title="Approve my plan"
          disabled={busy || closed || !day.briefing || approved}
          onPress={() =>
            void run(
              () => command('PlanApproved', { dayId: day.id, planVersion: day.briefing!.version! }),
              'Plan approved by the sole local participant.',
            )
          }
        />
      </Card>
      <Card>
        <Heading>Private human factors</Heading>
        <DraftStatus draft={reflectionDraft} />
        <Note>
          Saved only in your user database. Excluded from community timelines/exports. This app does
          not provide a PIN or encrypted user switching. AI is not configured.
        </Note>
        <Field
          label="My private reflection"
          multiline
          value={reflection}
          onChangeText={setReflection}
        />
        <Button
          title="Save private reflection"
          disabled={busy}
          onPress={() =>
            void run(async () => {
              await personalCommand('ReflectionSaved', {
                dayId: day.id,
                communityId: data.communityId,
                text: reflection,
              });
              await reflectionSession.clear();
            }, 'Private reflection saved.')
          }
        />
      </Card>
      <Card>
        <Heading>Record a field decision</Heading>
        <DraftStatus draft={decisionDraft} />
        <View style={styles.row}>
          <Button
            title="Within agreed plan"
            primary={decision.authority === 'within'}
            disabled={busy || closed}
            onPress={() => setDecision({ ...decision, authority: 'within' })}
          />
          <Button
            title="Departure"
            primary={decision.authority === 'departure'}
            disabled={busy || closed}
            onPress={() => setDecision({ ...decision, authority: 'departure' })}
          />
        </View>
        <Field
          label="Action"
          value={decision.action}
          onChangeText={(action) => setDecision({ ...decision, action })}
          editable={!closed}
        />
        <Field
          label="Rationale"
          multiline
          value={decision.rationale}
          onChangeText={(rationale) => setDecision({ ...decision, rationale })}
          editable={!closed}
        />
        {decision.authority === 'within' ? (
          <Field
            label="Agreed trigger / authority"
            value={decision.trigger}
            onChangeText={(trigger) => setDecision({ ...decision, trigger })}
            editable={!closed}
          />
        ) : (
          <View style={styles.row}>
            <Switch
              accessibilityLabel="I approve this departure"
              value={decision.soloApproval}
              onValueChange={(soloApproval) => setDecision({ ...decision, soloApproval })}
              trackColor={{ true: colors.green }}
            />
            <Note>I explicitly approve this departure as the sole participant.</Note>
          </View>
        )}
        <Button
          title="Record decision"
          disabled={busy || closed}
          onPress={() =>
            void run(async () => {
              await command('FieldDecisionRecorded', decision);
              await decisionSession.clear();
            }, 'Decision recorded.')
          }
        />
      </Card>
    </View>
  );
}
