# Use case 2 — Multi-day trip planning

Priority: 2  
Status: Planned; only basic local trip records implemented

## Goal

A backcountry user can prepare and execute a trip with one or more planned overnight stays or a finish on a later local calendar day, using a coherent itinerary, overnight locations, daily routes, and offline information for the entire trip without requiring connectivity or an API.

## Actors and context

A local user plans within an organization they belong to. The trip, itinerary days, participants, and field records retain the same owning organization. Future collaboration must enforce membership and sharing permissions.

## Community and group context

A community (the existing organization workspace) contains groups and trips. Users may participate in multiple communities and groups. Trip participants and trip-leader assignments are explicit; leadership coordinates the group rather than transferring all responsibility or implying professional authority. Self-guided is the default; guided mode uses explicitly configured responsibilities.

Every day trip, including one linked to a multi-day trip, owns its daily process and observations. See the [community and trip model](../../architecture/community-trip-model.md) and [leadership requirements](../expedition-leadership-human-factors.md).

## Workflow

1. Select the active user and organization; create or reopen a multi-day trip.
2. Set the trip name, start/end dates, trip time zone, participants, and overall objectives.
3. Build an ordered itinerary by creating or linking day trips, each with its date, route, overnight location, daily process, and observations. Include explicitly marked rest days where needed.
4. Record daily departure/arrival expectations, alternative routes, exit options, and contingency plans where applicable.
5. Review available environmental information for each stage and prepare maps and information covering the entire itinerary.
6. Save and reopen the complete plan offline; record progress, tracks, observations, and itinerary changes during the trip.
7. Review and export the whole trip or individual stages after completion.

## Scope and boundaries

Use [day-trip planning](day-trip-planning.md) for trips planned to start and finish on the same local calendar day without an overnight stay. Both trip variants share the canonical trip model and core capabilities; multi-day planning links ordered day trips rather than copying their daily processes or observations into the parent.

Phase 1 covers offline planning and field execution, maps, GPS tracks, observations, and GPX export. Phase 2 adds stage-specific weather and recent observation context. Each itinerary stage links a day trip with its own [daily process](daily-process.md)/OperationalDay context and observation collection; professional OperationalDay features extend that shared daily lifecycle. Field evidence follows [observation reporting](observation-reporting.md).

Local planning and capture must remain independent of remote services. Synchronization is added without making it a prerequisite for using the itinerary.

## Definition of done

### Shared community and day-trip requirements

- The record belongs to an explicit community. Group participation, trip participants, and applicable trip-leader roles are visible and validated.
- Every day trip has its own daily process and observation collection, whether standalone or linked to a multi-day trip. Empty observations and an unstarted daily process are valid initial states.
- Participants can contribute assessments and raise concerns without leader approval. Individual choices to decline are not overridden by voting.
- Readiness, concerns, and human-factor reflections follow participant-controlled visibility in views, reports, exports, synchronization, and AI context.
- Tests verify day-trip linkage, role scope, organization boundaries, and privacy rules before these capabilities are marked complete.

### Local planning baseline

- A user can create, view, edit, and delete a multi-day trip with a name, start/end dates, trip time zone, participants, and overall planning notes.
- The planned end date is later than the start date in the trip time zone. Required fields and invalid ranges are rejected before saving.
- The user can create, link, edit, reorder, and unlink day trips, including rest days, with daily route details, overnight locations, and notes. Links reference real day-trip records in the same community, not duplicated child documents.
- Initially a day trip belongs to at most one multi-day execution. Unlinking it preserves its daily process, observations, and provenance. A parent summary aggregates authorized day-specific records without widening access.
- Stage dates remain within the trip range and follow itinerary order. Changing trip dates or removing a stage requires resolving affected references explicitly; linked field records are not silently deleted.
- The complete itinerary shows each planned day, its route/rest status, and overnight location where applicable. Unspecified routes or overnight locations are clearly labeled as missing.
- Trips and stages retain stable identifiers, organization, authorship, schema versions, and creation/update timestamps. Track and observation links identify their trip and optional stage.
- Organization switching and application-layer membership checks prevent accidental cross-organization reads, writes, or links.
- After initial installation/caching, the entire itinerary can be created, edited, and reopened offline and survives restart, including an interruption between trip days.
- Export/import preserves stage order, dates, overnight locations, ownership metadata, and record associations.
- Automated checks cover date/time-zone validation, stage ordering, reference handling, organization scoping, offline persistence, and a multi-day export/import round trip.

### Phase 1 field completion

- The user can download map coverage for all stages, see readiness per stage, and distinguish incomplete coverage before departure.
- Maps and saved planning information remain accessible offline across the full itinerary, including after application restart.
- Tracking can be started/stopped across multiple days without overwriting earlier segments. Coordinates and timestamps persist locally and are linked to the trip and applicable stage.
- Observations and attachments can be linked to the trip and a stage without requiring a network connection.
- The user can revise remaining stages offline without losing original captured tracks or observations.
- Whole-trip and stage-level GPX exports open in an independent consumer and preserve track coordinates, timestamps, and segment boundaries.
- Once synchronization is enabled, itinerary changes and field records synchronize after connectivity returns with visible pending/error/conflict states, no silent data loss, and no duplicate records on retry.

### Phase 2 environmental enrichment

- Forecast snapshots and observations are associated with the relevant stage's location, elevation context, and applicable time window.
- Sources and retrieval times are preserved. Missing forecasts, forecast-horizon gaps, and stale information are visible for each affected stage.
- Refreshing information preserves the snapshots used for earlier planning or daily reviews.

## Current implementation gap

The PWA currently creates, lists, deletes, and backs up basic local trip records. Multi-day classification, date ranges/time zones, itinerary stages, overnight locations, editing, participant management, map coverage, GPS tracking, GPX export, environmental integrations, and synchronization remain unimplemented.
