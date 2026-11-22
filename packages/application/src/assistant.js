import {
  briefingPlans,
  makeEvent,
  applyCommunity,
  applyUser,
  mindsets,
  blankDebrief,
  planLabel,
  reorderPlans,
} from '@open-mountain/domain';
export const assistantExamples = [
  'Our objective is to explore the north ridge. Plan A is the ridge. Hazards for plan A: wind loading. Change conditions: turn back if visibility drops.',
  'Observation: Fresh wind loading on the ridge. Visibility is deteriorating.',
  'Private reflection: I am tired and want to discuss a shorter day.',
];
const identity = (value) =>
  value
    .trim()
    .replace(/[.!?]+$/, '')
    .trim();
const labelIndex = (label) =>
  [...label.toUpperCase()].reduce((value, char) => value * 26 + char.charCodeAt(0) - 64, 0) - 1;
export function proposeAssistantUpdate({
  text,
  state,
  personal,
  userId,
  communityId,
  dayId,
  now,
  createId,
  timeZone,
}) {
  const day = state.days[dayId];
  const actions = [],
    changes = [],
    unrecognized = [];
  let briefing = day?.briefing
    ? { ...day.briefing, plans: briefingPlans(day.briefing).map((p) => ({ ...p })) }
    : {
        objective: '',
        plans: [{ id: createId(), description: '', hazards: '' }],
        triggers: '',
        assessment: '',
        mindset: 'Assessment',
        problems: [],
      };
  let debrief = { ...(day?.debrief || blankDebrief) },
    briefingChanged = false,
    debriefChanged = false,
    reflection;
  const add = (scope, command) => actions.push({ id: createId(), scope, command });
  const segments = text
    .trim()
    .split(
      /\n+|;\s*|(?<=[.!?])\s+(?=(?:our objective|objective|we want|plan [a-z]|hazards for|change conditions|triggers|my hazard assessment|mindset|observation|i observed|private|human factors|expected conditions|actual activity|what went well|next time|public human factors|move plan|add a plan|create a (?:day )?trip))/i,
    )
    .map((s) => s.trim())
    .filter(Boolean);
  if (!text.trim() || text.length > 8000)
    return {
      error: 'Enter between 1 and 8,000 characters.',
      changes: [],
      unrecognized: [],
      actions: [],
    };
  if (!communityId || !state.community || state.community.deletedAt)
    return {
      error: 'Create or select a community in Settings first.',
      changes: [],
      unrecognized: [],
      actions: [],
    };
  for (const sentence of segments) {
    let match;
    if (
      (match = sentence.match(
        /^create a day trip (?:called |named )?(.+?) on (\d{4}-\d{2}-\d{2})[.!]?$/i,
      ))
    ) {
      if (segments.length !== 1)
        return {
          error: 'Create the trip first, then send its daily notes in the next message.',
          changes: [],
          unrecognized: [],
          actions: [],
        };
      add('community', {
        type: 'TripCreated',
        payload: {
          id: createId(),
          title: identity(match[1]),
          startDate: match[2],
          endDate: match[2],
          timeZone,
        },
      });
      changes.push(`Create day trip: ${identity(match[1])} · ${match[2]}`);
      continue;
    }
    if (
      (match = sentence.match(
        /^create a trip (?:called |named )?(.+?) from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})[.!]?$/i,
      ))
    ) {
      if (segments.length !== 1)
        return {
          error: 'Create the trip first, then send its daily notes in the next message.',
          changes: [],
          unrecognized: [],
          actions: [],
        };
      add('community', {
        type: 'TripCreated',
        payload: {
          id: createId(),
          title: identity(match[1]),
          startDate: match[2],
          endDate: match[3],
          timeZone,
        },
      });
      changes.push(`Create trip: ${identity(match[1])} · ${match[2]} to ${match[3]}`);
      continue;
    }
    if (!day) {
      unrecognized.push(sentence);
      continue;
    }
    if (
      (match = sentence.match(/^(?:our objective(?: is)?|objective|we want to)\s*[:—-]?\s+(.+)$/i))
    ) {
      briefing.objective = identity(match[1]);
      briefingChanged = true;
      changes.push(`Objective: ${briefing.objective}`);
    } else if ((match = sentence.match(/^(?:add a plan)\s*:\s*(.+)$/i))) {
      if (
        briefing.plans.length === 1 &&
        !briefing.plans[0].description &&
        !briefing.plans[0].hazards
      )
        briefing.plans[0].description = identity(match[1]);
      else briefing.plans.push({ id: createId(), description: identity(match[1]), hazards: '' });
      briefingChanged = true;
      changes.push(`Add plan ${planLabel(briefing.plans.length - 1)}: ${identity(match[1])}`);
    } else if ((match = sentence.match(/^plan ([a-z]{1,2})(?: is|:)\s*(.+)$/i))) {
      const index = labelIndex(match[1]);
      if (index > briefing.plans.length || index >= 100) {
        unrecognized.push(sentence);
        continue;
      }
      if (index === briefing.plans.length)
        briefing.plans.push({ id: createId(), description: '', hazards: '' });
      briefing.plans[index].description = identity(match[2]);
      briefingChanged = true;
      changes.push(`Plan ${planLabel(index)}: ${identity(match[2])}`);
    } else if ((match = sentence.match(/^hazards for plan ([a-z]{1,2})\s*:\s*(.+)$/i))) {
      const plan = briefing.plans[labelIndex(match[1])];
      if (!plan) {
        unrecognized.push(sentence);
        continue;
      }
      plan.hazards = identity(match[2]);
      briefingChanged = true;
      changes.push(`Plan ${match[1].toUpperCase()} hazards: ${plan.hazards}`);
    } else if (
      (match = sentence.match(/^move plan ([a-z]{1,2}) before plan ([a-z]{1,2})[.!]?$/i))
    ) {
      const from = labelIndex(match[1]),
        to = labelIndex(match[2]);
      if (!briefing.plans[from] || !briefing.plans[to]) {
        unrecognized.push(sentence);
        continue;
      }
      briefing.plans = reorderPlans(briefing.plans, from, from < to ? to - 1 : to);
      briefingChanged = true;
      changes.push(
        `Reorder plans: ${match[1].toUpperCase()} before ${match[2].toUpperCase()}. Review letter references in change conditions.`,
      );
    } else if ((match = sentence.match(/^(?:change conditions|triggers)\s*:\s*(.+)$/i))) {
      briefing.triggers = identity(match[1]);
      briefingChanged = true;
      changes.push(`Change conditions: ${briefing.triggers}`);
    } else if ((match = sentence.match(/^my hazard assessment\s*:\s*(.+)$/i))) {
      briefing.assessment = identity(match[1]);
      briefingChanged = true;
      changes.push(`Public hazard assessment: ${briefing.assessment}`);
    } else if ((match = sentence.match(/^mindset\s*:\s*(.+)$/i))) {
      briefing.mindset =
        mindsets.find((m) => m.toLowerCase() === identity(match[1]).toLowerCase()) ||
        identity(match[1]);
      briefingChanged = true;
      changes.push(`Mindset: ${briefing.mindset}`);
    } else if ((match = sentence.match(/^(?:observation|i observed)\s*:?\s+(.+)$/i))) {
      add('community', {
        type: 'ObservationRecorded',
        payload: {
          dayId,
          id: createId(),
          title: identity(match[1]).slice(0, 120),
          notes: match[1],
          location: '',
          observedAt: now,
        },
      });
      changes.push(`Public observation: ${match[1]}`);
    } else if (
      (match = sentence.match(/^(?:private reflection|private note|human factors)\s*:\s*(.+)$/i))
    ) {
      reflection = [
        reflection ?? personal.reflections[`${communityId}:${dayId}`]?.text ?? '',
        match[1],
      ]
        .filter(Boolean)
        .join('\n');
      changes.push(`Private reflection (only your user database): ${reflection}`);
    } else if (
      (match = sentence.match(
        /^(expected conditions|actual activity|what went well|next time|public human factors)\s*:\s*(.+)$/i,
      ))
    ) {
      const key = {
        'expected conditions': 'expected',
        'actual activity': 'actual',
        'what went well': 'good',
        'next time': 'change',
        'public human factors': 'humanFactors',
      }[match[1].toLowerCase()];
      debrief[key] = identity(match[2]);
      debriefChanged = true;
      changes.push(`${match[1]}: ${debrief[key]}`);
    } else unrecognized.push(sentence);
  }
  if (!day && !actions.length)
    return {
      error: 'Select an operational day in Trip data, or create a trip with the example phrase.',
      changes,
      unrecognized,
      actions: [],
    };
  if (briefingChanged) {
    const { planA, hazardsA, planB, hazardsB, ...payload } = briefing;
    add('community', { type: 'BriefingSaved', payload: { ...payload, dayId } });
    changes.push(
      'Save a briefing draft. Any previous plan approval will be invalidated. Unfilled sections remain blank.',
    );
  }
  if (reflection !== undefined)
    add('user', { type: 'ReflectionSaved', payload: { dayId, communityId, text: reflection } });
  if (debriefChanged) {
    if (
      Object.values({
        expected: debrief.expected,
        actual: debrief.actual,
        humanFactors: debrief.humanFactors,
        good: debrief.good,
        change: debrief.change,
      }).some((v) => !v.trim())
    )
      return {
        error:
          'Include all five debrief topics, or edit your debrief in Trip data. Nothing has been saved.',
        changes,
        unrecognized,
        actions: [],
      };
    add('community', { type: 'DebriefSaved', payload: { ...debrief, dayId } });
  }
  if (unrecognized.length)
    return {
      error:
        'Some sentences need clarification. Rephrase them using the supported phrases, or use Trip data. Nothing has been saved.',
      changes,
      unrecognized,
      actions: [],
    };
  if (!actions.length)
    return {
      error: 'No supported changes found. Use the examples or edit directly in Trip data.',
      changes,
      unrecognized,
      actions: [],
    };
  // Domain validation happens before review and again against durable state on save.
  try {
    let community = state,
      user = personal;
    for (const action of actions) {
      const e = makeEvent(action.scope === 'user' ? user : community, action.command, {
        actorId: userId,
        scopeId: action.scope === 'user' ? userId : communityId,
        eventId: action.id,
        now,
      });
      if (action.scope === 'user') user = applyUser(user, e);
      else community = applyCommunity(community, e);
    }
  } catch (error) {
    return { error: error.message, changes, unrecognized, actions: [] };
  }
  return {
    userId,
    communityId,
    dayId: dayId || null,
    communityRevision: state.revision,
    personalRevision: personal.revision,
    actions,
    changes,
    unrecognized,
    error: '',
  };
}
