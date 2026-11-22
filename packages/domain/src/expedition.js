import { validateIdentifier } from './identifiers.js';
import { briefingPlans } from './plans.js';
// State/events are JSON data; this clone also works on Hermes without structuredClone.
const copyJson = (value) => JSON.parse(JSON.stringify(value));
export const mindsets = [
  'Assessment',
  'Stepping Out',
  'Status Quo',
  'Stepping Back',
  'Entrenchment',
  'Open Season',
  'Spring Diurnal',
  'Maintenance',
  'High Alert',
];
export const problemTypes = [
  'Storm Slab',
  'Wind Slab',
  'Persistent Slab',
  'Deep Persistent Slab',
  'Loose Dry',
  'Loose Wet',
  'Wet Slab',
  'Cornice Fall',
  'Glide Avalanche',
];
export const blankDebrief = { expected: '', actual: '', humanFactors: '', good: '', change: '' };
export const emptyCommunity = () => ({ community: null, trips: {}, days: {}, revision: 0 });
export const emptyUser = () => ({
  profile: null,
  communities: [],
  reflections: {},
  assistantNotes: {},
  localAI: { enabled: false },
  revision: 0,
});
export function datesBetween(start, end) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start || '') || !/^\d{4}-\d{2}-\d{2}$/.test(end || ''))
    throw new Error('Choose valid trip dates');
  const first = Date.parse(`${start}T00:00:00Z`),
    last = Date.parse(`${end}T00:00:00Z`);
  if (
    !Number.isFinite(first) ||
    !Number.isFinite(last) ||
    new Date(first).toISOString().slice(0, 10) !== start ||
    new Date(last).toISOString().slice(0, 10) !== end ||
    last < first ||
    last - first > 89 * 86400000
  )
    throw new Error('Trip dates must be ordered and span at most 90 days');
  return Array.from({ length: (last - first) / 86400000 + 1 }, (_, i) =>
    new Date(first + i * 86400000).toISOString().slice(0, 10),
  );
}
export const dayKey = (tripId, date) => `${tripId}:${date}`;
const required = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required`);
  return value.trim();
};
function validateText(value) {
  if (typeof value !== 'string' || value.length > 30000)
    throw new Error('Text must be at most 30,000 characters');
}
function validateTime(value) {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value)))
    throw new Error('Choose a valid observation time');
}
export function validateProblems(problems) {
  if (!Array.isArray(problems) || problems.length > 20)
    throw new Error('At most 20 avalanche problems are supported');
  for (const problem of problems) {
    if (!problemTypes.includes(problem.type))
      throw new Error('Choose a supported avalanche problem');
    for (const key of ['terrain', 'likelihood', 'evidence']) validateText(problem[key] ?? '');
    if (
      problem.minSize !== '' &&
      problem.minSize != null &&
      (!Number.isInteger(Number(problem.minSize)) ||
        Number(problem.minSize) < 1 ||
        Number(problem.minSize) > 5)
    )
      throw new Error('Size must be 1–5 or unknown');
    if (
      problem.maxSize !== '' &&
      problem.maxSize != null &&
      (!Number.isInteger(Number(problem.maxSize)) ||
        Number(problem.maxSize) < 1 ||
        Number(problem.maxSize) > 5)
    )
      throw new Error('Size must be 1–5 or unknown');
    if (problem.minSize && problem.maxSize && Number(problem.minSize) > Number(problem.maxSize))
      throw new Error('Size range is reversed');
  }
}
function validatePlans(plans) {
  if (!Array.isArray(plans) || plans.length < 1 || plans.length > 100)
    throw new Error('Provide between 1 and 100 plans');
  const ids = new Set();
  for (const plan of plans) {
    if (
      !plan ||
      typeof plan !== 'object' ||
      Object.keys(plan).some((key) => !['id', 'description', 'hazards'].includes(key))
    )
      throw new Error('Unsupported plan fields');
    identifier(plan.id);
    if (ids.has(plan.id)) throw new Error('Plan IDs must be unique');
    ids.add(plan.id);
    validateText(plan.description);
    validateText(plan.hazards);
  }
}
const payloadKeys = {
  ProfileConfigured: ['username'],
  AssistantNoteRecorded: ['id', 'text', 'communityId', 'dayId', 'context'],
  AssistantNoteUpdated: ['id', 'status', 'response', 'engine'],
  LocalAIConfigured: ['enabled'],
  CommunityAdded: ['id', 'name'],
  CommunityUpdated: ['id', 'name'],
  CommunityRenamed: ['name'],
  CommunityDeleted: [],
  CommunityRemoved: ['id'],
  ReflectionSaved: ['dayId', 'communityId', 'text'],
  CommunityCreated: ['name'],
  TripCreated: ['id', 'title', 'startDate', 'endDate', 'timeZone'],
  TripMoved: ['sourceId', 'targetId', 'confirmed'],
  BriefingSaved: [
    'dayId',
    'objective',
    'plans',
    'planA',
    'hazardsA',
    'planB',
    'hazardsB',
    'triggers',
    'assessment',
    'mindset',
    'problems',
    'version',
  ],
  PlanApproved: ['dayId', 'planVersion'],
  FieldDecisionRecorded: ['dayId', 'authority', 'action', 'rationale', 'trigger', 'soloApproval'],
  ObservationRecorded: [
    'dayId',
    'id',
    'title',
    'notes',
    'observedAt',
    'location',
    'audioId',
    'audioName',
    'point',
    'authorId',
    'createdAt',
    'updatedAt',
  ],
  ObservationCorrected: [
    'dayId',
    'id',
    'title',
    'notes',
    'observedAt',
    'location',
    'audioId',
    'audioName',
    'point',
    'authorId',
    'createdAt',
    'updatedAt',
  ],
  ReportSubmitted: ['dayId', 'observationVersion', 'nothingToAdd'],
  DebriefSaved: ['dayId', 'expected', 'actual', 'humanFactors', 'good', 'change', 'completedAt'],
  DayClosed: ['dayId'],
  RouteAttached: ['dayId', 'title', 'kind', 'url', 'fileId', 'fileName', 'points', 'segments'],
};
function identifier(value) {
  if (
    typeof value !== 'string' ||
    !/^[a-zA-Z0-9][a-zA-Z0-9:-]{0,220}$/.test(value) ||
    ['constructor', 'prototype', '__proto__'].includes(value)
  )
    throw new Error('Invalid record identifier');
}
const identityEventTypes = new Set(['ProfileConfigured', 'CommunityAdded', 'CommunityCreated']);
export function makeEvent(state, command, context) {
  return buildEvent(state, command, context);
}
function buildEvent(state, command, context, legacyIdentity = false) {
  const { actorId, scopeId, now, eventId } = context;
  required(actorId, 'Actor');
  required(scopeId, 'Database scope');
  required(eventId, 'Event ID');
  validateTime(now);
  const payload = copyJson(command.payload || {});
  const type = command.type;
  identifier(actorId);
  identifier(scopeId);
  identifier(eventId);
  if (!payloadKeys[type] || Object.keys(payload).some((key) => !payloadKeys[type].includes(key)))
    throw new Error('Unsupported action fields');
  if (JSON.stringify(payload).length > 100000) throw new Error('Action payload is too large');
  for (const key of ['id', 'dayId', 'communityId', 'sourceId', 'targetId'])
    if (payload[key] != null) identifier(payload[key]);
  if (state.profile !== undefined) {
    if (scopeId !== actorId) throw new Error('Personal database scope must match its user');
    if (type === 'ProfileConfigured') {
      if (legacyIdentity) {
        required(payload.username, 'Username');
        if (payload.username.length > 80) throw new Error('Username must be at most 80 characters');
      } else validateIdentifier(payload.username, 'Username', 80);
    } else if (type === 'AssistantNoteRecorded') {
      required(payload.id, 'Note ID');
      required(payload.text, 'Note');
      validateText(payload.text);
      if (payload.text.length > 8000) throw new Error('Notes must be at most 8,000 characters');
      required(payload.communityId, 'Community ID');
      required(payload.context, 'Context');
      validateText(payload.context);
      if (state.assistantNotes?.[payload.id]) throw new Error('Note already exists');
    } else if (type === 'AssistantNoteUpdated') {
      if (!state.assistantNotes?.[payload.id]) throw new Error('Choose an existing note');
      if (
        ![
          'recorded',
          'processing',
          'review',
          'clarification',
          'saving',
          'saved',
          'error',
          'stopped',
        ].includes(payload.status)
      )
        throw new Error('Invalid note status');
      validateText(payload.response || '');
      if (payload.engine && !['phrases', 'local-model'].includes(payload.engine))
        throw new Error('Invalid processing engine');
    } else if (type === 'LocalAIConfigured') {
      if (typeof payload.enabled !== 'boolean')
        throw new Error('Choose whether local AI is enabled');
    } else if (type === 'CommunityAdded') {
      if (!legacyIdentity) validateIdentifier(payload.id, 'Community ID');
      required(payload.name, 'Community name');
      if (!legacyIdentity && state.communities.some((c) => c.id === payload.id))
        throw new Error('Community ID already exists');
    } else if (type === 'CommunityRemoved') {
      if (!state.communities.some((c) => c.id === payload.id && !c.removedAt))
        throw new Error('Choose an active community');
    } else if (type === 'CommunityUpdated') {
      required(payload.name, 'Community name');
      if (payload.name.length > 100)
        throw new Error('Community name must be at most 100 characters');
      if (!state.communities.some((c) => c.id === payload.id && !c.removedAt))
        throw new Error('Choose an existing community');
    } else if (type === 'ReflectionSaved') {
      required(payload.dayId, 'Day ID');
      required(payload.communityId, 'Community ID');
      validateText(payload.text);
    } else throw new Error('Unknown personal action');
    if (!state.profile && type !== 'ProfileConfigured')
      throw new Error('Create your profile first');
    if (state.profile && state.profile.id !== actorId)
      throw new Error('This personal database belongs to another user');
  } else {
    if (type !== 'CommunityCreated' && (!state.community || state.community.ownerId !== actorId))
      throw new Error('This community belongs to another local profile');
    if (state.community?.deletedAt && type !== 'CommunityCreated')
      throw new Error('Community has been deleted');
    if (type === 'CommunityCreated') {
      if (state.community) throw new Error('Community already exists');
      if (!legacyIdentity) validateIdentifier(scopeId, 'Community ID');
      required(payload.name, 'Community name');
    } else if (type === 'CommunityDeleted') {
      // Retain the journal and attachments as backup history.
    } else if (type === 'CommunityRenamed') {
      required(payload.name, 'Community name');
      if (payload.name.length > 100)
        throw new Error('Community name must be at most 100 characters');
    } else if (type === 'TripCreated') {
      required(payload.id, 'Trip ID');
      required(payload.title, 'Trip name');
      required(payload.timeZone, 'Trip time zone');
      try {
        new Intl.DateTimeFormat('en', { timeZone: payload.timeZone });
      } catch {
        throw new Error('Invalid trip time zone');
      }
      datesBetween(payload.startDate, payload.endDate);
      if (state.trips[payload.id]) throw new Error('Trip already exists');
    } else if (type === 'TripMoved') {
      const source = state.trips[payload.sourceId],
        target = state.trips[payload.targetId];
      if (
        !source ||
        !target ||
        source.id === target.id ||
        source.movedTo ||
        target.movedTo ||
        source.startDate !== source.endDate
      )
        throw new Error('Select a standalone day trip and a different destination');
      const date = source.startDate;
      if (Object.values(state.days).some((d) => d.tripId === target.id && d.date === date))
        throw new Error('Merge — Coming soon. Both trips are unchanged.');
      datesBetween(
        date < target.startDate ? date : target.startDate,
        date > target.endDate ? date : target.endDate,
      );
      if (payload.confirmed !== true) throw new Error('Confirm moving the day and its history');
    } else {
      const day = Object.hasOwn(state.days, payload.dayId) ? state.days[payload.dayId] : null;
      if (!day) throw new Error('Choose an existing operational day');
      if (
        ['BriefingSaved', 'PlanApproved', 'FieldDecisionRecorded', 'DebriefSaved'].includes(type) &&
        day.closedAt
      )
        throw new Error('This day is closed; observations can still be added or corrected');
      if (type === 'BriefingSaved') {
        payload.plans = briefingPlans(payload);
        for (const key of ['planA', 'hazardsA', 'planB', 'hazardsB']) delete payload[key];
        validatePlans(payload.plans);
        for (const key of ['objective', 'triggers', 'assessment']) validateText(payload[key] ?? '');
        if (!mindsets.includes(payload.mindset)) throw new Error('Choose a strategic mindset');
        if (payload.mindset === 'Maintenance')
          throw new Error(
            'Professional terrain-management profiles are not enabled in this solo version',
          );
        validateProblems(payload.problems);
      } else if (type === 'PlanApproved') {
        const plan = day.briefing;
        if (!plan || payload.planVersion !== plan.version)
          throw new Error('Review the current plan version before approving');
        validatePlans(briefingPlans(plan));
        for (const item of briefingPlans(plan)) {
          required(item.description, 'Each plan destination / course of action');
          required(item.hazards, 'Each plan hazards (or explicit unknown / not assessed)');
        }
        for (const key of ['objective', 'triggers', 'assessment'])
          required(plan[key], 'All briefing sections (or explicit unknown / not assessed)');
      } else if (type === 'FieldDecisionRecorded') {
        required(payload.action, 'Decision');
        required(payload.rationale, 'Rationale');
        if (!day.approval || day.approval.planVersion !== day.briefing?.version)
          throw new Error('Approve the current plan first');
        if (!['within', 'departure'].includes(payload.authority))
          throw new Error('Choose decision authority');
        if (payload.authority === 'within') required(payload.trigger, 'Agreed trigger / authority');
        if (payload.authority === 'departure' && payload.soloApproval !== true)
          throw new Error('Explicitly approve the departure as the sole local participant');
      } else if (type === 'ObservationRecorded' || type === 'ObservationCorrected') {
        required(payload.id, 'Observation ID');
        required(payload.title, 'Observation title');
        validateText(payload.location || '');
        if (payload.audioId != null && !/^file-[a-zA-Z0-9-]+$/.test(payload.audioId))
          throw new Error('Invalid audio attachment');
        if (
          payload.point &&
          (!Number.isFinite(payload.point.latitude) ||
            Math.abs(payload.point.latitude) > 90 ||
            !Number.isFinite(payload.point.longitude) ||
            Math.abs(payload.point.longitude) > 180 ||
            !Number.isFinite(payload.point.accuracy) ||
            payload.point.accuracy < 0)
        )
          throw new Error('Invalid point location');
        validateText(payload.notes ?? '');
        validateTime(payload.observedAt);
        if (type === 'ObservationCorrected' && !day.observations[payload.id])
          throw new Error('Observation no longer exists');
        if (type === 'ObservationRecorded' && day.observations[payload.id])
          throw new Error('Observation already exists');
      } else if (type === 'ReportSubmitted') {
        if (payload.observationVersion !== day.observationVersion)
          throw new Error('Observations changed; review before submitting');
        if (!Object.keys(day.observations).length && payload.nothingToAdd !== true)
          throw new Error('Confirm nothing to add');
      } else if (type === 'DebriefSaved') {
        for (const key of Object.keys(blankDebrief))
          required(payload[key], 'Each debrief topic (or explicitly not discussed)');
      } else if (type === 'DayClosed') {
        if (day.closedAt) throw new Error('Day is already closed');
        if (
          !day.submission ||
          day.submission.observationVersion !== day.observationVersion ||
          !day.debrief
        )
          throw new Error('Submit your current observations and finish the debrief before closing');
      } else if (type === 'RouteAttached') {
        if (!['planned', 'actual'].includes(payload.kind))
          throw new Error('Choose planned route or recorded track');
        required(payload.title, 'Route title');
        if (payload.url) {
          const url = new URL(payload.url);
          if (!['https:', 'http:'].includes(url.protocol))
            throw new Error('Use an http or https link');
        }
        if (!payload.url && !payload.fileId)
          throw new Error('Upload a GPX file or provide an external link');
      } else throw new Error('Unknown day action');
    }
  }
  return {
    id: eventId,
    version: identityEventTypes.has(type) ? 2 : 1,
    type,
    scopeId,
    actorId,
    recordedAt: now,
    occurredAt: payload.observedAt || now,
    payload,
  };
}
export function applyCommunity(state, event) {
  const next = copyJson(state),
    p = event.payload;
  const day = p.dayId && next.days[p.dayId];
  if (event.type === 'CommunityCreated')
    next.community = { id: event.scopeId, name: p.name, ownerId: event.actorId };
  else if (event.type === 'CommunityDeleted') next.community.deletedAt = event.recordedAt;
  else if (event.type === 'CommunityRenamed') next.community.name = p.name.trim();
  else if (event.type === 'TripCreated') {
    next.trips[p.id] = { ...p, leaderId: event.actorId };
    for (const date of datesBetween(p.startDate, p.endDate)) {
      const id = dayKey(p.id, date);
      next.days[id] = {
        id,
        tripId: p.id,
        date,
        observations: {},
        routes: [],
        observationVersion: 0,
        briefing: null,
        approval: null,
        decisions: [],
        debrief: null,
        submission: null,
        closedAt: null,
        summary: 'not-configured',
      };
    }
  } else if (event.type === 'TripMoved') {
    const source = next.trips[p.sourceId];
    const moved = Object.values(next.days).find((d) => d.tripId === source.id);
    moved.tripId = p.targetId;
    source.movedTo = p.targetId;
    const target = next.trips[p.targetId];
    target.startDate = moved.date < target.startDate ? moved.date : target.startDate;
    target.endDate = moved.date > target.endDate ? moved.date : target.endDate;
    for (const date of datesBetween(target.startDate, target.endDate)) {
      if (!Object.values(next.days).some((d) => d.tripId === target.id && d.date === date)) {
        const id = dayKey(target.id, date);
        next.days[id] = {
          id,
          tripId: target.id,
          date,
          observations: {},
          routes: [],
          observationVersion: 0,
          briefing: null,
          approval: null,
          decisions: [],
          debrief: null,
          submission: null,
          closedAt: null,
          summary: 'not-configured',
        };
      }
    }
  } else if (event.type === 'BriefingSaved') {
    day.briefing = { ...p, plans: briefingPlans(p), version: (day.briefing?.version || 0) + 1 };
    day.approval = null;
  } else if (event.type === 'PlanApproved')
    day.approval = { planVersion: p.planVersion, eventId: event.id, approvedAt: event.recordedAt };
  else if (event.type === 'FieldDecisionRecorded')
    day.decisions.push({ ...p, eventId: event.id, planVersion: day.briefing.version });
  else if (['ObservationRecorded', 'ObservationCorrected'].includes(event.type)) {
    const old = day.observations[p.id];
    day.observations[p.id] = {
      ...p,
      authorId: old?.authorId || event.actorId,
      createdAt: old?.createdAt || event.recordedAt,
      updatedAt: event.recordedAt,
    };
    day.observationVersion++;
    if (day.closedAt && day.submission)
      day.submission = {
        ...day.submission,
        observationVersion: day.observationVersion,
        amendedAt: event.recordedAt,
      };
    day.summary = 'not-configured';
  } else if (event.type === 'ReportSubmitted')
    day.submission = {
      observationVersion: p.observationVersion,
      submittedAt: event.recordedAt,
      authorId: event.actorId,
    };
  else if (event.type === 'DebriefSaved') day.debrief = { ...p, completedAt: event.recordedAt };
  else if (event.type === 'DayClosed') {
    day.closedAt = event.recordedAt;
    day.summaryRequestedAt = event.recordedAt;
  } else if (event.type === 'RouteAttached')
    day.routes.push({ ...p, authorId: event.actorId, recordedAt: event.recordedAt });
  else throw new Error('Unsupported community event');
  next.revision++;
  return next;
}
export function applyUser(state, event) {
  return projectUser(copyJson(state), event);
}
function projectUser(next, event) {
  const p = event.payload;
  if (event.type === 'ProfileConfigured')
    next.profile = { id: event.actorId, username: p.username.trim() };
  else if (event.type === 'LocalAIConfigured') next.localAI = { enabled: p.enabled };
  else if (event.type === 'AssistantNoteRecorded') {
    next.assistantNotes ||= {};
    next.assistantNotes[p.id] = {
      ...p,
      status: 'recorded',
      sequence: next.revision,
      createdAt: event.recordedAt,
      updatedAt: event.recordedAt,
      transitions: [{ status: 'recorded', at: event.recordedAt }],
    };
  } else if (event.type === 'AssistantNoteUpdated') {
    const note = next.assistantNotes[p.id];
    next.assistantNotes[p.id] = {
      ...note,
      ...p,
      updatedAt: event.recordedAt,
      transitions: [...note.transitions, { status: p.status, at: event.recordedAt }],
    };
  } else if (event.type === 'CommunityAdded') {
    if (!next.communities.some((c) => c.id === p.id))
      next.communities.push({ id: p.id, name: p.name });
  } else if (event.type === 'CommunityRemoved') {
    next.communities = next.communities.map((c) =>
      c.id === p.id ? { ...c, removedAt: event.recordedAt } : c,
    );
  } else if (event.type === 'CommunityUpdated') {
    next.communities = next.communities.map((c) =>
      c.id === p.id ? { ...c, name: p.name.trim() } : c,
    );
  } else if (event.type === 'ReflectionSaved')
    next.reflections[`${p.communityId}:${p.dayId}`] = { text: p.text, updatedAt: event.recordedAt };
  else throw new Error('Unsupported personal event');
  next.revision++;
  return next;
}
export function replay(events, scope = 'community') {
  let state = scope === 'user' ? emptyUser() : emptyCommunity();
  const ids = new Map();
  let owner, scopeId;
  for (const event of events) {
    if (
      !event ||
      !(event.version === 1 || (event.version === 2 && identityEventTypes.has(event.type))) ||
      typeof event.id !== 'string' ||
      !event.payload
    )
      throw new Error('Unsupported event schema');
    if (ids.has(event.id)) {
      if (ids.get(event.id) !== JSON.stringify(event))
        throw new Error('Conflicting duplicate event');
      continue;
    }
    if (!owner) {
      owner = event.actorId;
      scopeId = event.scopeId;
    }
    if (event.actorId !== owner || event.scopeId !== scopeId)
      throw new Error('Unexpected event ownership');
    const validated = buildEvent(
      state,
      { type: event.type, payload: event.payload },
      { actorId: event.actorId, scopeId: event.scopeId, now: event.recordedAt, eventId: event.id },
      event.version === 1,
    );
    state = scope === 'user' ? projectUser(state, validated) : applyCommunity(state, validated);
    ids.set(event.id, JSON.stringify(event));
  }
  return state;
}
