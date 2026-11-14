# Use case 3 — Daily process

Priority: 3  
Status: Planned; basic local daily records implemented

## Goal

A user can follow a repeatable daily cycle: review current information, record expectations, prepare a plan or briefing, capture changes during the day, and close the day with a traceable review. Professional organizations can later apply the same cycle to multiple teams within an OperationalDay.

## Actors and context

Initially, a local user works in one active organization. Later, authorized organization members may coordinate teams, assignments, assessments, and decisions. Local profiles do not imply authenticated collaboration.

## Community and group context

A community (the existing organization workspace) contains groups and trips. Users may participate in multiple communities and groups. Trip participants and trip-leader assignments are explicit; leadership coordinates the group rather than transferring all responsibility or implying professional authority. Self-guided is the default; guided mode uses explicitly configured responsibilities.

Every day trip, including one linked to a multi-day trip, owns its daily process and observations. See the [community and trip model](../../architecture/community-trip-model.md) and [leadership requirements](../expedition-leadership-human-factors.md).

## Workflow

1. **Collaborative preparation:** Confirm the day trip, objectives, alternatives, group capabilities, equipment, turnaround criteria, communication, and emergency arrangements. Check that the plan suits the whole group.
2. **Morning conditions update:** Review new information independently before group discussion; distinguish reconsideration from seeking confirmation of the original objective.
3. **Shared assessment and planning:** Discuss hazards, exposure, uncertainty, readiness, fatigue, capabilities, and alternatives. Invite quieter participants to contribute.
4. **Group briefing:** Confirm the objective, route, timing, roles, operating limits, emergency arrangements, and readiness. Every participant can ask questions or raise concerns.
5. **Field execution and reassessment:** Record observations and revisit the plan at consequential decision points. Consider commitment pressure, fatigue, and whether everyone can speak freely.
6. **Group debrief:** Compare expectations with observations and review decisions, communication, disagreements, and turnaround criteria without assigning blame.
7. **Shared report and next-day preparation:** Consolidate authorized evidence and lessons. Participants contribute; designated editors manage publication. Carry authorized lessons into the next linked day trip while retaining private reflections.

## Scope and boundaries

The local baseline is a daily planning and review record. Phase 2 adds weather expectations, observations, comparisons, summaries, and briefing presentation. Phase 4 adds OperationalDay, multiple teams, participant assignments, professional assessments, decisions, and reporting.

Every day trip has a daily lifecycle/OperationalDay context. The initial generic daily record does not yet implement that relationship or the full professional workflow. Shared domain concepts must support both recreational and professional experience profiles.

## Definition of done

### Shared community and day-trip requirements

- The record belongs to an explicit community. Group participation, trip participants, and applicable trip-leader roles are visible and validated.
- Every day trip has its own daily process and observation collection, whether standalone or linked to a multi-day trip. Empty observations and an unstarted daily process are valid initial states.
- Participants can contribute assessments and raise concerns without leader approval. Individual choices to decline are not overridden by voting.
- Readiness, concerns, and human-factor reflections follow participant-controlled visibility in views, reports, exports, synchronization, and AI context.
- Tests verify day-trip linkage, role scope, organization boundaries, and privacy rules before these capabilities are marked complete.

### Local daily workflow baseline

- A user can create, reopen, edit, and delete a daily record with a date, title, information review, objectives/plan, briefing notes, and end-of-day review.
- A record can reference relevant trips and observations without copying away their provenance.
- Each record retains organization, author, schema version, and creation/update timestamps.
- Required fields and invalid references are rejected; references cannot silently cross organization boundaries.
- The complete local cycle works after an offline reload, persists after restart, and is included in export/import.
- Automated checks verify validation, organization scoping, linked records, persistence, and offline reopening.

### Phase 2 environmental review

- Expected and observed weather can be recorded separately and compared for an explicit location, elevation context, and time window.
- The briefing preserves the forecast snapshots and observation references used to prepare it.
- Missing, stale, and unavailable information is labeled; summaries do not invent values for missing inputs.
- Users can view relevant recent observations and a daily weather summary with source attribution.

### Phase 4 professional completion

- An OperationalDay supports multiple teams and participant assignments in one organization.
- Trips/activities and observations can be associated with the responsible team and OperationalDay.
- Briefings, assessments, and decisions retain author, time, supporting evidence, and revision history.
- Professional vocabulary and validation are applied through the professional experience profile while retaining the shared canonical domain model.
- A daily operational report can be exported with its evidence references and decision history.
- Membership and authorization checks protect collaborative updates once a backend exists.

### Self-guided daily-cycle completion

- All seven stages can be recorded per day trip, including successive days of a multi-day trip, with plan/evidence references and accountable authorship.
- Independent assessments, readiness checks, concerns, checkpoint decisions, disagreements, and debriefs meet the linked human-factor use-case definitions of done.
- Shared reports exclude private material unless explicitly authorized; editor publication does not imply all participants agreed with every decision.

## Current implementation gap

The PWA currently creates, lists, deletes, and backs up daily records containing a title, date, and notes. Editing, structured daily stages, links to trips/observations, weather review, OperationalDay, teams, and traceable professional decisions remain unimplemented.
