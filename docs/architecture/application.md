# Application architecture

Status: Solo React/TypeScript PWA implemented; Expo native app added; backend and JSON customization deferred

## Initial application

Build a React progressive web app (PWA) with Vite. Publish the build as a static site, with all application data stored locally for the initial implementation. No application backend is required for this phase.

The first workflows are [day-trip planning, multi-day trip planning, daily process, and observation reporting](../product/use-cases.md).

The PWA should support installation and offline use. Cache the application shell with a service worker and store domain data in PouchDB. Application updates and local data migrations must preserve existing records. Mapping and other external data need explicit offline availability rules; caching the application shell alone does not make those resources available offline.

## Voice and event foundation

[Voice-first interaction and event-driven state](events-and-voice.md) is the required direction: speech is transcribed into validated commands, durable accepted events update projected application data, and forms remain optional for targeted corrections. Single-phone unanimous group approval is supported as an attributable event. The solo app now validates commands, appends accepted events to scoped PouchDB journals, and reconstructs data by replay. The event engine and shared TypeScript contracts are independent of React. Optional browser dictation and offline audio capture provide the current voice path; server extraction remains unavailable.

## Current rendering and future customization

Use normal React components with TypeScript and Vite in the current mobile/desktop PWA. This follows the user's latest direction to defer the JSON renderer for simplicity. Reusable React planning/debrief fields stay separate from domain command validation. The old UI-schema package is reserved but is not imported by the app.

Community and personal JSON-configured views remain future scope. If reintroduced, user overrides should take precedence over community defaults, with controlled component registries and no bypass of domain approval/privacy rules. See [ADR 0002](decisions/0002-solo-event-journals-and-react-ui.md).

## Expo native application

The Expo/React Native/TypeScript app in `projects/mobile` implements the solo workflow using shared domain/application packages and a native SQLite adapter. Audio, local files, document picking, sharing, and point location use Expo modules. Metro exports iOS/Android bundles; signed binaries and hardware testing remain separate. See [ADR 0003](decisions/0003-expo-native-sqlite-adapter.md) and the [native guide](../../projects/mobile/README.md).

Platform-specific native and React web components remain separate. The browser persistence package is not imported into native code. Future server synchronization still needs its own contract; native SQLite does not automatically replicate with CouchDB.

## Local persistence now; synchronization later

Use PouchDB with browser-local storage for the PWA. The confirmed target is separate databases per user and per community, with local offline copies; see [database scopes](database-scopes.md). The current single local database is only a scaffold and needs migration. Keep storage access behind repository interfaces so domain logic is independent of database details.

The next phase adds [CouchDB collaboration](couchdb-collaboration.md) using its built-in users/authentication, user-set passwords, database security, and PouchDB synchronization. Backend deployment, remote authentication, authorization, replication, conflict resolution, and server-side organization isolation are deferred. There is no remote synchronization or account service in the initial phase.

Use stable record identifiers, explicit organization ownership, schema versions, and source metadata from the start. Keep local storage migrations separate from future API or replication compatibility policies. Define conflict handling, deletion propagation, database topology, and authorized replication scope before enabling synchronization.

Local data remains on the browser/device unless explicitly exported. Include local export and import in the persistence design because browser storage can be cleared or lost.

## Communities, groups, and trip composition

The [community and trip model](community-trip-model.md) defines a community as the existing organization workspace. Communities contain groups and trips; multi-day trips link day trips. Each day trip owns its daily process and observations. Users can hold multiple memberships and trip-scoped leader roles. These relationships remain planned and are not implemented by the current generic records.

[Leadership and human-factor requirements](../product/expedition-leadership-human-factors.md) establish self-guided as the default and guided as optional, using shared canonical entities. Private readiness and reflection data requires access enforcement beyond local profile switching before implementation.

## Users and organizations

The model supports multiple users and multiple organizations. A user may belong to multiple organizations, and an organization may have multiple users. Represent this many-to-many relationship through membership records.

Initial concepts:

- **User:** A local profile with a stable identifier; a profile is not a remotely authenticated account.
- **Organization:** A workspace with a stable identifier.
- **Membership:** A relationship between a user and an organization, with room for future role and permission policies.
- **Active context:** The currently selected user and organization. Organization selection is limited to that user's memberships.
- **Organization-owned record:** A trip, daily process record, or observation associated with an explicit organization identifier and its author/source.

Initially, profiles, organizations, memberships, and records are local to the installation. Multiple local profiles do not provide concurrent access from other devices or security isolation between people sharing a browser profile.

Scope queries, writes, and UI state to the active organization. Preserve the organization identifier on stored records and prevent accidental cross-organization display when switching context. Local filtering is a usability boundary; future backend authorization must independently enforce access and sharing policies.

## Repository placement

Apply the [monorepo proposal](monorepo.md) incrementally:

```text
projects/
  pwa/                     # React, Vite, service worker, web components
  mobile/                  # Expo/React Native solo app
packages/
  domain/                  # Domain types, identifiers, and membership model
  application/             # Use cases and platform-independent services
  ui-schema/               # JSON definitions, versions, and validation
  storage-pouchdb/          # Browser persistence adapter
  storage-sqlite/           # Expo native SQLite adapter
deploy/                    # Static hosting now; backend deployment later
```

The PWA and Expo native app are implemented for solo local use; only the API directory remains a documentation placeholder. Add further directories with their implementation. Keep platform-specific renderers in their application until shared code has a demonstrated consumer.

## Delivery phases

The [phased roadmap](../product/roadmap.md) defines delivery phases 0–5 and their acceptance gates. The [use cases](../product/use-cases.md) define the goals and definitions of done for day-trip planning, multi-day trip planning, daily process, and observation reporting.

The current local-only PWA is an initial foundation, not a completed Phase 0 or Phase 1. The API still needs a runnable foundation, and native device verification remains outstanding. The PWA remains independent of the API.

Native SQLite journals, transactional schema migration, and attachment indexing are implemented in ADR 0003. Future synchronization still needs a contract for native/browser differences, conflicts, and the CouchDB relationship. Neither SQLite nor PouchDB alone supplies those domain-level synchronization rules.
