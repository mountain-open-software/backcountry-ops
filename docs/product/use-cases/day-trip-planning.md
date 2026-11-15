# Use case 1 — Day-trip planning

Priority: 1  
Status: Local trip/day planning implemented; full field/environmental integrations remain planned

## Goal

A backcountry user can plan and execute a trip that starts and finishes on the same local calendar day, with a route, participants, environmental context, and an offline information package, without requiring connectivity or an API.

## Actors and context

A local user plans within an organization they belong to. A user may plan trips for multiple organizations; each trip has one owning organization. Future team collaboration must respect memberships and sharing permissions.

## Community and group context

A community (the existing organization workspace) contains groups and trips. Users may participate in multiple communities and groups. Trip participants and trip-leader assignments are explicit; leadership coordinates the group rather than transferring all responsibility or implying professional authority. Self-guided is the default; guided mode uses explicitly configured responsibilities.

Every day trip, including one linked to a multi-day trip, owns its daily process and observations. See the [community and trip model](../../architecture/community-trip-model.md) and [leadership requirements](../expedition-leadership-human-factors.md).

## OperationalDay composition

A standalone single-day trip has exactly one OperationalDay. All participants record on that day; separate operating groups need separate trips. That day owns the daily process, observations, and activities. When linked into a multi-day itinerary, its day view resolves to the corresponding OperationalDay owned by the multi-day trip rather than creating duplicate daily records. See [daily-process ownership](daily-process.md#operationalday-ownership).

## Workflow

1. Select the active user and organization.
2. Create or reopen a day trip with its name, local trip date, intended departure/return times, route, and planning notes.
3. Add participants, route/location details, and available terrain and environmental information.
4. Review the route, turnaround/return plan, and available information; identify missing, stale, or unavailable information.
5. Prepare the required maps and information for offline use.
6. Save the plan, reopen it in the field, and export it when needed.

## Route and track inputs

Planned routes and recorded tracks are supplied only by file upload or external link to the participant's chosen app. No in-app route drawing, live GPS tracking, or provider API is required. Preserve uploader/source and distinguish planned routes from actual tracks. External links require network access; show this limitation rather than claiming the linked content is cached offline. Validate imported files and preserve original data for independent export.

## Scope and boundaries

A day trip has no planned overnight stay. Trips with an overnight stay or a planned finish on a later local calendar day use [multi-day trip planning](multi-day-trip-planning.md). Record the trip time zone so dates and times remain consistent when device settings change.

Phase 1 covers trip management, planning, offline maps, field execution, uploaded/linked recorded tracks, and GPX export. Phase 2 enriches planning with preserved weather forecasts and recent observations. Observation capture and reporting are specified in [observation reporting](observation-reporting.md); daily review is specified in [daily process](daily-process.md).

The initial local-only application must remain usable without a backend. Environmental integrations and synchronization add capabilities without becoming prerequisites for opening or editing a local trip.

## Definition of done

### Shared community and day-trip requirements

- The record belongs to an explicit community. Group participation, trip participants, and applicable trip-leader roles are visible and validated.
- Every day trip has its own daily process and observation collection, whether standalone or linked to a multi-day trip. Empty observations and an unstarted daily process are valid initial states.
- Participants can contribute assessments and raise concerns without leader approval. Individual choices to decline are not overridden by voting.
- Readiness, concerns, and human-factor reflections follow participant-controlled visibility in views, reports, exports, synchronization, and AI context.
- Tests verify day-trip linkage, role scope, organization boundaries, and privacy rules before these capabilities are marked complete.

### Local planning baseline

- A user can create, view, edit, and delete a day trip with a name, local trip date, trip time zone, intended departure/return times, route details, participants, and planning notes.
- Required fields are validated before saving. Planned departure and return fall on the same date in the trip time zone, and return must follow departure. A plan that crosses into another date is directed to the multi-day workflow without losing entered information.
- A turnaround plan and intended return are visible in the saved plan; actual field activity extending past midnight does not discard or invalidate captured data.
- Each trip retains its identifier, organization, author, schema version, and creation/update timestamps.
- Switching organizations shows only trips for the selected organization; selecting a non-member organization is rejected by the application layer.
- After the app has been installed/cached, a user can create, edit, and reopen a trip with the network disabled. Records survive application restart.
- The plan can be exported and restored without losing its domain fields or ownership metadata.
- Automated domain tests and a browser workflow test verify same-day/time-zone validation, persistence, offline use, and organization scoping.

### Phase 1 field completion

- A user can associate participants, a route, GPS tracks, and observations with the trip.
- A user can explicitly download an offline map area, see whether it is ready, and use it with the network disabled. Missing map coverage is clearly indicated.
- Users record GPS tracks in their own apps, then upload a track file or attach an external link (such as Strava or Outmap). Open Mountain does not start/stop tracking. Imported coordinates, timestamps, source, and original file remain available after restart.
- A trip can be planned and executed without connectivity; captured tracks and observations are persisted locally.
- Exported GPX opens in an independent GPX consumer and preserves track coordinates and timestamps.
- Once synchronization is implemented, queued trip changes synchronize after connectivity returns, with visible pending/error/conflict states and no silent data loss.

### Phase 2 environmental enrichment

- Weather snapshots and recent observations retain source, location, applicable time, and retrieval time.
- The user can distinguish unavailable, stale, forecast, and observed information.
- Environmental context is filtered and compared using the trip's geographic, elevation, and time context.

## Current implementation and remaining gap

See the [solo implementation guide](../solo-version-implementation.md) for the implemented React/TypeScript workflows, event history, databases, recordings, GPX/links, backups, and their limits. Only the sole local participant/leader is represented; no synchronization or server is required.

The broader acceptance criteria above include future collaboration, environmental information, provider integration, protected remote access, native storage, and AI capabilities. Those remain planned. No offline map package, live GPS track recording, automatic transcription guarantee, or generated AI summary is claimed. JSON view customization and day merging are deferred.
