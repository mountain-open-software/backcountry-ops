# ADR 0002 — Solo event journals and React/TypeScript UI

Status: Accepted for the local solo implementation; future collaborative storage remains a separate decision

## Context

The first version must work on mobile and desktop without an API. Its agreed workflow uses events, one OperationalDay per trip/date, separate user/community databases, private reflections, and local evidence. The user chose ordinary React with TypeScript and Vite for now, deferring the proposed personal/community JSON renderer.

## Decision

Use typed React feature components and reusable React planning/debrief fields. Shared TypeScript contracts describe trips, days, observations, commands, and event/storage interfaces. The existing shared JavaScript event engine validates commands and deterministically reconstructs state from accepted events. UI form edits and voice-derived notes go through the same command service.

Use one PouchDB database per user and one per community. Each database stores a version 2 `journal` document containing ordered, version 1 events. Append validates the current state and uses PouchDB revision compare-and-swap. A concurrent stale write is rejected visibly; it is not automatically reinterpreted or silently overwritten. Command IDs provide idempotency and cannot be reused for a different action. State is replayed rather than maintained as a second mutable source of truth.

Keep original recordings and GPX as immutable attachment documents in the owning community database. Store the attachment before appending its referencing event. A failed event append may leave an unreferenced file, but never claims an unsaved observation is committed. Preserve recording previews for retry; do not automatically delete possible evidence. Garbage collection is future work.

Create all days for a trip's date range in its single `TripCreated` event. A single journal revision therefore establishes the complete itinerary without partially created days. Day IDs and trip/date uniqueness are deterministic within the local community. A confirmed non-conflicting move preserves day/observation identity, archives the source trip as moved, and extends the destination date range if necessary (up to the 90-day limit); the confirmation explicitly mentions extension. An occupied destination date rejects the move with **Merge — Coming soon**.

Private reflections use only user-scoped events. Public day exports and timelines use only community events. A full backup explicitly includes private notes and attachments; it is not encrypted. Local profile switching/authenticated collaboration are not provided in this solo version.

## Bounds and recovery

- At most 90 dates per trip, 5,000 events and 15 million JSON characters per journal, 20 MB per attachment, and 100 MB for a full backup/import. These bounds keep initial full-journal replay and JSON backup practical; they are not a scalable collaborative event-store design.
- Interrupted app startup reconstructs state from accepted journal revisions. A rejected append leaves prior state intact. Multi-tab conflicts instruct the user to reload/retry.
- Backup restore validates event history, scopes, attachment presence, and matching history prefixes before writes. It adds a newer continuation or preserves newer local history; divergent histories are rejected, not merged. A restore interrupted across databases can be retried; it is not a multi-database atomic transaction.
- Earlier `open-mountain-v1` documents remain unchanged and downloadable as a previous-version archive. Their missing trip/day relationships prevent safe automatic conversion. Do not silently invent those links or erase the archive.
- Original audio is persisted when the user saves the captured recording as an observation. An unfinished recording or unsaved preview can be lost if the browser is killed; the UI distinguishes preview from saved evidence. Optional browser dictation may require the browser's online service. Neither offline transcription nor background recording is promised.

## Consequences and deferred work

The solo app has durable event-driven state and separate privacy scopes without requiring a backend. This implementation intentionally does not solve multi-writer CouchDB event ordering/conflicts, native SQLite, encrypted shared-device privacy, background audio capture, offline maps, or server AI. Define their contracts before enabling them. Remote replication cannot simply be switched on for the single-journal design without resolving concurrent appends.

The legacy UI-schema package remains reserved for future exploration but is not part of the PWA runtime. Community/personal JSON customization is deferred by the user's latest direction. Its future design must preserve domain validation and privacy.
