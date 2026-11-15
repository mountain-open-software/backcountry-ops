import { useDraft } from '../useDraft';
import { DraftStatus } from '../components/DraftStatus';
import { Button, Panel } from '../components/ui';
import type { Briefing as BriefingModel, FieldDecision } from '@open-mountain/domain';
import type { DayProps } from '../types';
import React, { useState } from 'react';
import { briefingPlans, mindsets, problemTypes } from '@open-mountain/domain';
import { BriefingFields } from '../components/PlanningFields';
export function Briefing({ day, workspace }: DayProps) {
  const { data, busy, run, command, personalCommand, storage } = workspace;
  const [values, setValues, briefingDraft, briefingSession] = useDraft<BriefingModel>(
    storage,
    data.userId,
    `${data.communityId}:${day.id}:briefing:${day.briefing?.version || 0}`,
    day.briefing || {
      objective: '',
      plans: [{ id: 'initial-plan-a', description: '', hazards: '' }],
      triggers: '',
      assessment: '',
      mindset: 'Assessment',
      problems: [],
    },
  );
  const [reflection, setReflection, reflectionDraft, reflectionSession] = useDraft(
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
  const update = <K extends keyof BriefingModel>(key: K, value: BriefingModel[K]) =>
    setValues((v) => ({ ...v, [key]: value }));
  const approved = Boolean(
    day.approval && day.briefing && day.approval.planVersion === day.briefing.version,
  );
  return (
    <div className="feature-grid">
      <Panel className="panel">
        <div className="section-heading">
          <h2>Morning briefing</h2>
          <span className={`pill ${approved ? 'positive' : ''}`}>
            {approved ? 'Plan approved' : 'Draft / review needed'}
          </span>
        </div>
        <DraftStatus draft={briefingDraft} />
        <p className="hint">
          Your own assessment and plan. Record unknowns explicitly. This is a solo local copy; no
          other person’s approval is implied.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              await command('BriefingSaved', {
                ...values,
                plans: briefingPlans(values),
                dayId: day.id,
              });
              await briefingSession.clear();
            }, 'Briefing saved. Review and approve this version.');
          }}
        >
          <fieldset disabled={busy || Boolean(day.closedAt)} className="fields">
            <label>
              Strategic mindset
              <select
                aria-label="Strategic mindset"
                value={values.mindset}
                onChange={(e) => update('mindset', e.target.value)}
              >
                {mindsets
                  .filter((name) => name !== 'Maintenance')
                  .map((name) => (
                    <option key={name}>{name}</option>
                  ))}
              </select>
            </label>
            <BriefingFields
              values={values}
              onChange={update}
              onPlansChange={(plans) => update('plans', plans)}
              disabled={busy || Boolean(day.closedAt)}
            />
            <details className="inset">
              <summary>Avalanche problems · CMAH</summary>
              <p className="hint">
                For each problem: type, location, likelihood, and size. Unknown is not low hazard.
                Likelihood is recorded in your own words until a standardized vocabulary is
                verified.
              </p>
              {values.problems.map((problem, index) => (
                <div className="problem" key={index}>
                  <h3>Problem {index + 1}</h3>
                  <label>
                    Problem type
                    <select
                      aria-label="Problem type"
                      value={problem.type}
                      onChange={(e) =>
                        update(
                          'problems',
                          values.problems.map((p, i) =>
                            i === index ? { ...p, type: e.target.value } : p,
                          ),
                        )
                      }
                    >
                      {problemTypes.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </label>
                  {(
                    [
                      ['terrain', 'Elevation, aspects, and terrain'],
                      ['likelihood', 'Likelihood and trigger context'],
                      ['evidence', 'Evidence and uncertainty'],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <input
                        value={problem[key] || ''}
                        onChange={(e) =>
                          update(
                            'problems',
                            values.problems.map((p, i) =>
                              i === index ? { ...p, [key]: e.target.value } : p,
                            ),
                          )
                        }
                      />
                    </label>
                  ))}
                  <div className="row">
                    {(
                      [
                        ['minSize', 'Minimum size'],
                        ['maxSize', 'Maximum size'],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key}>
                        {label}
                        <select
                          value={problem[key] || ''}
                          onChange={(e) =>
                            update(
                              'problems',
                              values.problems.map((p, i) =>
                                i === index ? { ...p, [key]: e.target.value } : p,
                              ),
                            )
                          }
                        >
                          <option value="">Unknown</option>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                  <Button
                    type="button"
                    onClick={() =>
                      update(
                        'problems',
                        values.problems.filter((_, i) => i !== index),
                      )
                    }
                  >
                    Remove problem
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={() =>
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
              >
                Add avalanche problem
              </Button>
            </details>
            <Button className="primary" type="submit">
              Save briefing draft
            </Button>
          </fieldset>
        </form>
        <div className="action-row">
          <Button
            disabled={busy || !day.briefing || approved || Boolean(day.closedAt)}
            onClick={() =>
              run(
                () =>
                  command('PlanApproved', { dayId: day.id, planVersion: day.briefing!.version! }),
                'Plan approved by you, the sole local participant.',
              )
            }
          >
            Approve my plan
          </Button>
          <p className="hint">Saving a revised briefing clears its previous approval.</p>
        </div>
      </Panel>
      <div className="stack">
        <Panel className="panel private-panel">
          <p className="eyebrow">PERSONAL DATABASE</p>
          <h2>Private human factors</h2>
          <DraftStatus draft={reflectionDraft} />
          <p className="hint">
            Readiness, comfort, pressure, fatigue, or anything you want to reflect on privately.
            These notes are excluded from community exports and timelines. Separate storage is not
            encryption on a shared device.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await personalCommand('ReflectionSaved', {
                  dayId: day.id,
                  communityId: data.communityId,
                  text: reflection,
                });
                await reflectionSession.clear();
              }, 'Private reflection saved in your user database.');
            }}
          >
            <label>
              My private reflection
              <textarea
                aria-label="My private reflection"
                rows={5}
                value={reflection}
                maxLength={30000}
                onChange={(e) => setReflection(e.target.value)}
              />
            </label>
            <Button disabled={busy}>Save private reflection</Button>
          </form>
          <p className="service-note">Human-bias AI: not configured. No risk score is inferred.</p>
        </Panel>
        <Panel className="panel">
          <h2>Record a field decision</h2>
          <DraftStatus draft={decisionDraft} />
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await run(
                () => command('FieldDecisionRecorded', { ...decision, dayId: day.id }),
                'Decision recorded in the timeline.',
              );
              if (ok)
                void decisionSession.reset({
                  ...decision,
                  action: '',
                  rationale: '',
                  trigger: '',
                  soloApproval: false,
                });
            }}
          >
            <fieldset className="fields" disabled={busy || Boolean(day.closedAt)}>
              <label>
                Decision authority
                <select
                  aria-label="Decision authority"
                  value={decision.authority}
                  onChange={(e) =>
                    setDecision({
                      ...decision,
                      authority: e.target.value as FieldDecision['authority'],
                    })
                  }
                >
                  <option value="within">Within the agreed plan — leader approval</option>
                  <option value="departure">
                    Departure from agreement — explicit solo approval
                  </option>
                </select>
              </label>
              <label>
                Action
                <input
                  aria-label="Action"
                  required
                  value={decision.action}
                  onChange={(e) => setDecision({ ...decision, action: e.target.value })}
                />
              </label>
              <label>
                Rationale
                <textarea
                  aria-label="Rationale"
                  required
                  value={decision.rationale}
                  onChange={(e) => setDecision({ ...decision, rationale: e.target.value })}
                />
              </label>
              {decision.authority === 'within' ? (
                <label>
                  Agreed trigger or authority
                  <input
                    aria-label="Agreed trigger or authority"
                    required
                    value={decision.trigger}
                    onChange={(e) => setDecision({ ...decision, trigger: e.target.value })}
                  />
                </label>
              ) : (
                <label className="check">
                  <input
                    type="checkbox"
                    checked={decision.soloApproval}
                    onChange={(e) => setDecision({ ...decision, soloApproval: e.target.checked })}
                  />
                  I approve this departure as the sole local participant.
                </label>
              )}
              <Button type="submit">Record decision</Button>
            </fieldset>
          </form>
        </Panel>
      </div>
    </div>
  );
}
