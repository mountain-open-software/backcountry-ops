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
