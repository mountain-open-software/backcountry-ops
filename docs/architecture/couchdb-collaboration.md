# Next phase — CouchDB collaboration

Status: Confirmed product direction; not implemented

## Phase boundary

Version one stays solo, local, password-free, and independent of any API or CouchDB server. The next delivery phase adds collaboration through CouchDB's built-in user authentication and database security. A user can then set a password for their account. This is the next local-to-collaborative milestone, not a claim that every earlier numbered roadmap phase has been completed.

## Identity and passwords

Use CouchDB's built-in user/account mechanism and authenticated sessions rather than introducing a separate custom identity database. Map the existing stable local user ID to the remote account explicitly; do not silently treat a matching display username as proof of account ownership.

CouchDB owns password verification and its stored password representation. Do not put plaintext passwords in profile documents, domain events, backups, replicated application records, logs, or AI inputs. Define account creation/claiming, username conflicts, password change/reset, session expiry/logout, and local-data association before enabling collaboration. Offline local operation must remain available without sending a password on every local action.

Use HTTPS for hosted access. Choose session handling and deployment/CORS settings for the static PWA explicitly; do not embed database administrator credentials in the application build.

## Per-user and per-community databases

Continue the [database scope model](database-scopes.md):

- Each user's private database is accessible to that user through CouchDB database security. Dedicated server AI access to permitted private summaries is separately scoped; community membership does not grant private-database access.
- Each community database admits its authorized members and administrators using CouchDB's built-in database security configuration (`_security`). A user may belong to multiple communities.
- Synchronize local copies only with databases the authenticated account is authorized to access. User-ID filters shape replication/application queries; they are not a replacement for authentication and database permissions.

CouchDB database membership is database-wide, not a document-level read filter. If every community member may read its public trip data, that maps directly to this boundary. Any narrower trip/group read restrictions need a separate database boundary or another explicitly designed access mechanism; do not promise them from `_security` alone. Private human-factor data never belongs in a community-readable database.

Built-in write validation (`validate_doc_update`) can enforce document-level write rules against authenticated identities/roles. Leader-only approvals, report authorship, user-role assignment, and protected event writes must also have enforceable server-side contracts; UI checks alone are insufficient once clients collaborate. Database administrator/server operator access is a separate trust boundary and must not be described as inaccessible to infrastructure operators.

## Events, replication, and concurrency

Use CouchDB/PouchDB replication for the supported browser adapters while preserving the application's event validation, idempotency, projection, and revision rules. Built-in replication transports records; it does not define group approval semantics or automatically resolve domain conflicts.

Before enabling multi-writer access, define:

- Reproducible database provisioning, `_security` and validation deployment, migrations, and least-privilege server AI access.
- Existing local user/community data association, export/recovery, and conflict handling when independently typed copies are introduced to a shared community. Do not auto-merge unrelated records because titles or dates match.
- One OperationalDay per trip/local date under concurrent creation. Conflicting day moves still show **Merge — Coming soon** until merge is explicitly implemented.
- Event identity/order, attachment conflicts, pending/rejected writes, and stale proposal approval handling.
- Membership revocation: stopping future server access does not remotely erase previously downloaded local data. Retention/device cleanup expectations must be explicit.

Future native SQLite synchronization remains a separate adapter/protocol decision; it is not automatically provided by browser PouchDB replication.

## Server AI

Server-side AI processes public proposals/closing summaries using community data. A distinct purpose-limited process may read authorized private summaries for the group-visible human-bias indicator. It must not expose raw private summaries or give community clients private database credentials. AI processing remains optional for local capture and day closure.

## Acceptance gates

- A local user can associate their existing stable profile with a CouchDB account, set/change a password, and sign in/out without losing local records.
- Unauthenticated users and users outside a community cannot read or write its database; a member of one community cannot obtain access to another merely by changing IDs.
- One user's credentials cannot read another user's private database. Private data does not appear in community replication, public events, exports, logs, or general AI context.
- Server-side validation rejects unauthorized event writes, identity spoofing, and leader-only actions by non-leaders.
- Authorized users can collaborate and synchronize after offline work; conflicts, revocation, expired sessions, and failed writes are visible and recoverable.
- Provisioning/security rules and migrations are repeatable and tested. No application bundle or backup contains administrator credentials or plaintext passwords.
- Every test distinguishes database-level read access, document write validation, application role rules, and server operator trust rather than treating them as one permission mechanism.
