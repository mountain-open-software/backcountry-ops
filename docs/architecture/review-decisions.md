# Decisions resolving the pre-implementation review

Status: Product decisions confirmed by the user; contracts and implementation pending

This document records answers to the [process/architecture review](process-architecture-review.md). It supersedes earlier conflicting recommendations; it does not claim the server or private AI workflow is implemented.

## D1 — Move an existing day trip after confirmation

When adding an existing standalone day trip to a multi-day trip/expedition, move it rather than making an independent copy. Ask for explicit confirmation before the move. Cancelling preserves its original ownership and links.

The confirmed move preserves the day, observations, and history rather than duplicating them. Record the move, source/destination ownership, affected references, actor, and time as an event. Group splits within a trip are not allowed. A separate operating group requires a separate trip; moving a day must preserve the one-day-per-trip/date invariant.

The persistence contract still needs to define exact aggregate IDs, reference updates, atomic recovery, authorization, and unlinking behavior. Implementation must not silently discard evidence or partially move a day.

## D2 — Separate user and community databases

Each user has their own database and each community has its own database, including local offline copies as applicable. Private human-factor sections/drafts remain in the owning user's database and are available offline. Public trip/day data belongs in the owning community's database. No PINs are required for this delivery.

Select the correct database scope and filter records by user ID during user-scoped synchronization. Community synchronization follows the active user's community membership. User ID supplied by a client is not server authorization: the future server must authenticate the requester and enforce ownership/membership before granting database access. Private payloads must not be copied into community databases merely because they reference a community trip.

AI runs on the server. The dedicated human-bias process may read permitted private summaries from user databases and publish only the permitted group indicator to the community database. General proposal/report generation reads public/community input, not private human-factor summaries. Offline private entry remains possible; AI processing waits for server availability.

Separate local databases and user-scoped application access are the chosen initial isolation model, not a promise of encryption against someone with access to the same browser/device storage. No PIN or additional device-protection workflow is introduced. Database naming, user/session identity, local switching, attachments, export/recovery, and server authorization contracts still need definition.

This supersedes the earlier server-only-private-storage interpretation. See the [database scope plan](database-scopes.md).

## D3 — Post-close amendments and approved versus revised summaries

The day stays closed after an observation/report is edited. A correction automatically amends the participant's report, queues summary refresh, and is recorded in the timeline; no separate resubmission is required for that correction. Keep the original submitted version and authorship.

A refreshed summary is a new immutable version with a visible notice that it incorporates edits made after closing. Previously approved summaries and the reports/observations used to produce them remain accessible. Distinguish the approved version from a revised version; generating a revision does not automatically approve it or rewrite prior approval history.

Each version records exact source revisions, generation time, related post-close events, and approval status. Pending or failed refreshes leave the last approved version accessible and identify it as predating the latest edits. Late completion of an older generation job must not replace the newer revised result. Viewing/exporting a summary identifies which version and status were selected.

The assigned leader approves the original closing summary and later revisions. Record approval against the exact summary/source revision. Until approved, a refreshed version remains revised/unapproved and does not replace the previous approved version. Summary approval is distinct from unanimous morning-plan approval and leader day closure.

## D4 — One shared OperationalDay per trip/date

No group splitting is supported within a trip. Everyone continues recording on the same day. A separately operating group needs a separate trip. Enforce exactly one OperationalDay per owning trip/local date, including multi-day trips and rest days. This supersedes all earlier same-trip split/copy requirements and associated inherited-approval questions.

## D5 — Merge is a coming-soon feature

When moving a day trip into an expedition with an existing day on that date, offer merging as the future resolution. Merge is explicitly deferred and must be labeled **Coming soon**; do not implement or silently perform it in the initial scope.

For now, a destination trip/date conflict leaves both records and their histories unchanged, explains why the move cannot complete, and shows the unavailable merge option. The user can cancel; no partial ownership transfer or duplicate OperationalDay is created. Non-conflicting moves still require confirmation under D1.

Future merge design must retain one OperationalDay for the destination trip/date, preserve both source histories and provenance, and define conflict resolution for plans, roles, assessments, approvals, submissions, and closing status before implementation.

## D6 — Local username profile for the API-free first version

The user sets their own local profile using a username. No API or remote login is required. Generate a stable user identifier distinct from the editable display name. Server AI and synchronization remain unavailable until configured; local workflows must not require them. See [version-one scope](../product/version-one-local.md) for the proposed delivery slice and remaining local participation decisions.

## D7 — Solo local copies; no synchronization yet

Version one assumes solo operation. Each user maintains an independent local copy and manually retypes information where necessary. There is no synchronization, collaborative database access, or shared-phone multi-participant submission requirement in this delivery. Collaboration is deferred until the server exists.

The local user is the active participant/leader; approval, own report submission, personal debrief, and explicit closing remain separate events. Group rules remain documented for later collaboration and must not be presented as proof of approval by people on other copies. Local backups remain recovery tools, not automatic multi-user merge/sync.

## D8 — Next phase: CouchDB users, passwords, and collaboration

After the solo version, add collaboration using CouchDB's built-in users/authentication and database security. Users can set a password in that phase. Keep user-private and community-shared databases separate. Map the stable local profile to a remote account explicitly; a local username alone is not authenticated identity. See the [CouchDB collaboration plan](couchdb-collaboration.md) for security boundaries, replication contracts, and acceptance gates. No passwords or server requirements are added to version one.

## D9 — Normal React/TypeScript rendering for now

The user chose normal React components with TypeScript and Vite, with mobile and desktop both required. Community/personal JSON customization is deferred for simplicity. Keep reusable React forms separate from shared domain validation; the UI-schema package remains reserved for later work. This supersedes the earlier plan to implement customizable JSON views in the first version.

## Remaining next questions

1. Define the future merge contract only when the coming-soon feature is scheduled; current conflicts leave both records unchanged.
2. How does the user/session identity map to local user databases and future authenticated database access, without PINs?
3. What event/storage contract defines database names, append consistency, attachments, migrations, moves, and recovery?
4. What score/output schema and evaluation make the server AI human-bias indicator useful without exposing individual private content?
