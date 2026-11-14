# User and community database scopes

Status: User-confirmed topology; storage contracts and implementation pending

## Version-one boundary

Each user runs an independent solo local copy. No synchronization or collaborative reconciliation is implemented or required now; information can be re-entered manually. User/community databases are local ownership boundaries, not shared remote databases in this version. Synchronization and server-authorization requirements below describe the future server phase, not background work the first version must perform.

## Ownership

| Database | Local contents | Future synchronization scope |
| --- | --- | --- |
| Per user | Private human-factor sections/summaries, private reflection events and evidence | Owning user ID; server-authorized user scope |
| Per community | Shared trips, OperationalDays, public assessments, plans, observations, submissions, approvals, debrief discussion, timelines, and approved/revised summaries | Authorized community membership and applicable trip/group visibility |

Users can have several community memberships. Database ownership and document authorship are different: a public observation authored by one user belongs to the relevant community database, not exclusively to that user's private database. Keep user profiles/membership references minimal in community records; exact identity-document ownership remains a contract decision.

Each database has a local copy where the user needs offline access. Private human-factor entry therefore remains available without a server. No PINs are required. The application selects the owning database and filters user-scoped sync by user ID; future remote endpoints independently enforce authenticated ownership/membership. Do not replicate an entire community's private assessments into a shared database and rely on UI filtering afterward.

This topology replaces the initial single-browser-database scaffold. Separate local databases do not encrypt records against direct same-device/browser-profile access. That limitation must be represented accurately; additional local locks are not part of the current decision.

## Next-phase identity and security

The next phase uses [CouchDB built-in authentication and database security](couchdb-collaboration.md), with users setting account passwords. User-private and community database scopes remain separate. CouchDB database permissions control whole-database reads; author-specific writes and leader authority need server-side validation. A user-ID filter alone is not authorization. Version one remains local and password-free.

## Server AI

AI runs on the server. The dedicated human-bias job reads only permitted private summaries from user-scoped data and emits the group-visible indicator to the appropriate community scope. Public combined-proposal and closing-report jobs use community data and cannot access private inputs through their ordinary context.

Offline input queues synchronize within their owning scope when connectivity/server access returns. Missing server AI is shown as pending/unavailable, not low risk or completed processing. Local daily workflows and leader closing do not depend on AI availability.

## Events and references

An event's payload belongs to the same privacy/ownership scope as the data it changes. Public events can refer to permitted context identifiers but cannot contain private assessment values or private transcript content. Define exactly which private metadata can be referenced before implementing group timelines.

Moves between trips in one community preserve evidence/history and require user confirmation. Cross-community moves are not automatically authorized by the trip-move decision. Group splitting within a trip is not supported. All participants record on the same day; distinct operating groups use separate trips. Private history remains in the owning user database.

Approval of a closing summary is a leader event tied to an exact summary and source revision. Keep earlier approved versions accessible when a revised summary is generated; approval does not overwrite history.

## Contracts still required

- Deterministic database naming/IDs, active user switching, and migration from the existing single local PouchDB database.
- User identity/authentication mapping, community membership authorization, and sync filters, including revocation and deleted records.
- Event append/revision consistency, projection replay, causal ordering, and database-specific migration/version policies.
- Offline attachments/private recordings, quota behavior, backup/export boundaries, recovery, and server AI access/retention.
- Native SQLite adapter and future CouchDB relationship; the topology does not imply direct SQLite replication is already solved.

## Acceptance scenarios

- Two users each keep a private local assessment; community queries, exports, timelines, and sync omit the private payloads.
- A user belongs to two communities; writes and synchronization use the selected authorized database without cross-community leakage.
- Offline private entry survives restart, syncs only within the owning user scope, and feeds server AI only through the dedicated authorized path.
- An unauthorized requester cannot gain remote access merely by supplying another user ID or database name.
- A trip has one day per local date, including retries/concurrent creation. A confirmed trip move preserves public evidence and rejects destination day conflicts without copying private material into the community store.
- The existing browser data migrates reproducibly without loss, and scoped backups restore to the correct owner databases.
