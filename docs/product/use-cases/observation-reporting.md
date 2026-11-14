# Use case 4 — Observation reporting

Priority: 4  
Status: Planned; basic local observation records implemented

## Goal

A user can capture a field observation without connectivity, preserve its original evidence and provenance, review and correct the structured record, and export or explicitly share a usable report.

## Actors and context

A local user records an observation for an organization they belong to, optionally within a trip or daily process. Future reviewers and external recipients receive information only through authorized sharing or submission workflows.

## Community and group context

A community (the existing organization workspace) contains groups and trips. Users may participate in multiple communities and groups. Trip participants and trip-leader assignments are explicit; leadership coordinates the group rather than transferring all responsibility or implying professional authority. Self-guided is the default; guided mode uses explicitly configured responsibilities.

Every day trip, including one linked to a multi-day trip, owns its daily process and observations. See the [community and trip model](../../architecture/community-trip-model.md) and [leadership requirements](../expedition-leadership-human-factors.md).

## Meaning of field reporting

Field reporting is each participant recording their own observations, including the leader's observations. There is no required separate narrative field report or leader approval of each observation. Voice-to-text is primary; accepted events update structured records, and forms support targeted corrections. Preserve the distinction between observer and recorder when one phone is used to record another person's account.

The OperationalDay's field reporting is the collection of these attributed observations. At closing, AI summarizes the submitted individual reports while preserving the source observations. External submission is distinct from capturing and submitting a report within the trip. Personal human-factor sections remain private. Each person submits their own report explicitly; recording observations alone is not submission. A nothing-to-add submission is explicit, not inferred. Preserve participant, day, submitted revision, and submission time as an event. The leader also submits their own report and does not silently submit for others.

The closing AI summary references submitted report revisions and preserves attribution, uncertainty, differences, and original evidence. It cannot read private human-factor sections or the summaries reserved for human-bias assessment. The day may close offline after all individual submissions and the debrief are complete; queue the AI summary for later processing. Summary failure or delay does not block closure or invalidate submissions. Summary approval remains to be decided.

## Automatic context capture

Minimize manual entry by automatically capturing as much relevant, available context as possible for a voice observation:

- Active user/observer and recorder, community, trip, OperationalDay, and applicable plan/assessment version.
- Recording/entry time, device time zone, and observation time when stated. Keep inferred/default time distinct from an explicitly reported event time.
- Available device location, location timestamp, horizontal accuracy, and altitude/vertical accuracy where supported. Do not present unavailable or stale GPS as a current precise location.
- Original audio reference, transcript, extraction status, and links to nearby relevant track points, recorded events, or plan-change triggers where available. Suggested associations remain distinguishable from confirmed facts.
- Relevant cached environmental data with source, retrieval time, and applicable location/time. Device context or a forecast must not be silently substituted for a person's field observation.

Request device permissions transparently and respect refusal. Capture continues with explicit missing context when permissions, sensors, battery, or connectivity are unavailable. Do not require GPS or transcription success before saving audio or a manual observation. Ask concise follow-up questions only for required or ambiguous details, with optional targeted editing.

Open Mountain does not record live GPS tracks. Participants upload recorded tracks from their own apps or attach external links. Permission-based point location on an observation is separate from continuous tracking. Context collection must show its status and controls. This requirement does not authorize continuous ambient microphone recording, hidden tracking, or inference of private psychological states. Background collection limits and battery tradeoffs must be defined and tested per platform rather than assumed to work when the app is suspended.

### Context-capture definition of done

- Voice observations can be saved with automatically available metadata, source/accuracy information, and clearly identified gaps, entirely offline.
- Users can inspect and correct inferred values without losing their origin or event history.
- Tests cover permission denial/revocation, unavailable/stale GPS, missing altitude, ambiguous reported time, offline transcription, interruption, and context changes between recording and saving.
- Capturing context never changes the observation's author, operating day, or group silently after a context switch.

## Observations after day closing

Participants can add or correct observations after the leader closes the OperationalDay, without reopening it. All changes appear in the OperationalDay timeline, including post-close additions and corrections. The timeline shows the actor, action, recorded time, and affected observation, with the original observation/event time separately visible. A late entry is not silently backdated into the earlier timeline or hidden by replacing the original record.

All changes pass through domain validation and are persisted as attributable events; corrections preserve the original values/evidence and observation time alongside correction time. Existing visibility and author permissions continue to apply.

Mark an AI closing summary based on older observation revisions as out of date and queue a refresh. Preserve previous summary versions and their source references. A pending or failed refresh does not change the day's closed status. Tests cover late additions, corrections, offline restart, event replay, and summary revision consistency.

## Workflow

1. Select the active organization and optional trip/daily context.
2. Capture a manual observation, location, observation time, and source; attach recordings or other evidence when supported.
3. Save locally and retain original evidence even if structured information is revised.
4. Review and correct the record, including any future AI-generated draft.
5. Export a report, or explicitly authorize sharing/submission when integrations become available.
6. Inspect synchronization or submission status and any errors without losing the local original.

## Scope and boundaries

Phase 1 covers manual observations, voice capture, local attachments, and basic synchronization. Phase 2 adds weather observations and recent observation feeds. Phase 3 adds transcription and AI-assisted extraction. Phase 4 adds professional observation types and validation. Phase 5 adds authorized external exchange.

Local saving must work without transcription, AI services, remote accounts, or an API. Synchronization, publishing to a feed, exporting, and submitting to an external platform are distinct actions.

## Definition of done

### Shared community and day-trip requirements

- The record belongs to an explicit community. Group participation, trip participants, and applicable trip-leader roles are visible and validated.
- Every day trip has its own daily process and observation collection, whether standalone or linked to a multi-day trip. Empty observations and an unstarted daily process are valid initial states.
- Participants can contribute assessments and raise concerns without leader approval. Individual choices to decline are not overridden by voting.
- Readiness, concerns, and human-factor reflections follow participant-controlled visibility in views, reports, exports, synchronization, and AI context.
- Tests verify day-trip linkage, role scope, organization boundaries, and privacy rules before these capabilities are marked complete.

### Local reporting baseline

- A user can create, reopen, edit, and delete a manual observation with a title/type, observation time, location, notes, and source attribution.
- Observation time and record creation time are stored separately. Unknown locations, times, or values are explicitly represented rather than invented.
- Each record retains a stable identifier, organization, author/source, schema version, and creation/update timestamps.
- Optional trip/daily associations are validated and cannot silently cross organization boundaries.
- Records can be captured and reopened after an offline reload and application restart.
- Export/import preserves observation fields, ownership, source attribution, and context references in a documented format usable outside the app.
- Automated tests verify validation, organization scoping, persistence, offline capture, and export/import round trips.

### Phase 1 field evidence and synchronization

- Voice recordings and attachments are stored locally, linked to the observation, and playable/readable without connectivity after restart.
- Permission denial, interrupted capture, and storage failure produce a visible error without falsely reporting a successful save.
- Exports include attachments or documented references plus the metadata needed to relate them to observations.
- Once synchronization is enabled, records and attachments synchronize after connectivity returns. Pending, failed, and conflicting changes are visible; retries do not create duplicate observations.

### Phase 3 AI-assisted reporting

- Voice evidence can produce a draft structured observation, while the original recording remains unchanged and available.
- Users can inspect and correct extracted values before approving a report.
- Drafts retain source references, uncertainty, provider/model context, and an audit trail of changes and approvals.
- AI output passes the same domain validation as manual input; agents cannot bypass validation or approval requirements.

### Phases 4–5 professional reporting and exchange

- Professional weather, snow profile, stability test, and avalanche observation types use the shared canonical model with profile-specific vocabulary and validation.
- Reports retain links to the relevant team, OperationalDay, evidence, and review history when applicable.
- Sharing/export metadata includes ownership, permissions, attribution, and applicable data licensing.
- External submissions require explicit authorization and use an isolated adapter. Destination, submitted version, time, outcome, and errors are traceable.
- Failed external submissions preserve the local original and can be retried without duplicate submission where the destination permits it.

## Current implementation gap

The PWA currently creates, lists, deletes, and backs up basic local observations with a title, date, location text, and notes. Editing, precise observation times, structured provenance, linked context, voice/attachment capture, synchronization, AI extraction, professional forms, and external submissions remain unimplemented.
