# Version one — Local operation without an API

Status: Confirmed solo/local runtime boundary; delivery slice proposed, implementation pending

## Confirmed runtime boundary

The first version runs locally without an API, remote login, CouchDB server, or AI service. The user sets their own local profile with a username. Generate a stable internal user ID so changing the displayed username does not change record ownership or database references. This profile is local identity, not authenticated identity on another device.

Use the confirmed separate user/community database topology. A username alone does not authenticate access to another person's data. Each user has their own independent local copy. Assume solo operation for version one, with manual re-entry when the same information is needed elsewhere. No synchronization, shared-device participant submissions, or cross-device coordination is required. Server-backed collaboration comes later.

## Solo interpretation of group rules

The local user is the sole active participant and leader for this version. Their explicit approval satisfies the one-person roster; their own submission, debrief, and leader closing remain distinct events. This does not approve anything on behalf of people using other local copies or claim the wider group has consented.

Morning objectives, hazard assessment, Plan A/Plan B, mindset, observations, and debrief remain useful in solo mode. Full group proposals, unanimous multi-person approvals, delegated shared-phone recording, team debrief attendance, and multi-user authorization are retained as future collaboration requirements, not first-version acceptance gates.

Do not add a replication scheduler, synchronization configuration, automatic reconciliation, or cross-device account flow now. Manual re-entry is the initial workflow. Backup/export remains for local recovery and independent data use, not a promised collaborative merge mechanism.

## Recommended first-version slice

- Local profile and community setup; create a trip and its date-scoped OperationalDays.
- Individual assessments and a manually prepared plan/proposal approved by the sole local participant; retain the future multi-person rules in the domain plan without requiring collaboration UI now.
- Plan A, Plan B, strategic mindset, hazards, and agreed change triggers.
- Attributed observation recording and timeline, primarily voice capture with typed/targeted edits when transcription is unavailable.
- Own report submission, personal debrief, and explicit local leader closing. Post-close corrections preserve history and do not reopen the day.
- Route/track file upload or external links; no live GPS track recording or route drawing.
- Scoped export/import and attachment backups so local browser data is recoverable.

This is a proposed delivery slice, not a declaration that the current scaffold implements it or that the full roadmap's Phase 0/1 acceptance gates are met.

## Server-dependent features

- Private human-factor entries can remain local in the owning user database; server-generated human-bias indicators are unavailable without a server.
- AI combined proposals and closing summaries show **AI not configured** when no service exists. Users may prepare manual proposals/notes. Do not imply that a nonexistent server is processing a queue or label unavailable AI as low risk.
- Preserve source revisions/events needed for later summary generation. A durable request may remain pending, but no network retry loop should target an unconfigured endpoint. Neither unavailable AI nor missing summaries blocks otherwise valid leader day closing.
- Transcription depends on demonstrated device/browser capability; preserve audio offline and allow a typed fallback. Do not promise universally available offline speech recognition.
- Cross-device synchronization and authenticated collaboration are unavailable. Uploading a route file or importing a backup is not automatic synchronization.

## Before implementation

The remaining first-version decisions are exact community onboarding, event-storage/migration contract, supported import formats, and local attachment/backup limits. Solo ownership and manual re-entry are confirmed; shared-phone group recording and synchronization are later scope. Private human-factor UI must accurately describe the initial per-user-database isolation without claiming PIN/encryption protection that is not configured.

Future merge remains **Coming soon**. Destination-date conflicts leave both records unchanged.

## Next phase

Collaboration uses [CouchDB's built-in users and database security](../architecture/couchdb-collaboration.md). Users can then set account passwords. Associate remote accounts with existing local user IDs deliberately, and preserve local data. This does not introduce login or synchronization requirements into the first version.
