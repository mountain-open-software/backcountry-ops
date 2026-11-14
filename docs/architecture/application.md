# Application architecture

Status: Initial local-only PWA scaffold implemented; native app and backend deferred

## Initial application

Build a React progressive web app (PWA) with Vite. Publish the build as a static site, with all application data stored locally for the initial implementation. No application backend is required for this phase.

The first workflows are [day-trip planning, multi-day trip planning, daily process, and observation reporting](../product/use-cases.md).

The PWA should support installation and offline use. Cache the application shell with a service worker and store domain data in PouchDB. Application updates and local data migrations must preserve existing records. Mapping and other external data need explicit offline availability rules; caching the application shell alone does not make those resources available offline.

## Voice and event foundation

[Voice-first interaction and event-driven state](events-and-voice.md) is the required direction: speech is transcribed into validated commands, durable accepted events update projected application data, and forms remain optional for targeted corrections. Single-phone unanimous group approval is supported as an attributable event. The existing form-driven direct PouchDB writes are an initial scaffold and must be refactored before claiming this architecture is implemented.

## JSON-driven rendering

Use versioned JSON definitions to describe screens, forms, and workflow presentation. A React renderer maps supported definition types to a controlled component registry. Keep business rules, permissions, and persistence behind shared interfaces rather than embedding them in presentation definitions.

Validate definitions before rendering. Treat definitions as data rather than executable code, and provide a clear fallback for unsupported definition versions or component types. The definition schema and renderer library remain to be selected.

## React Native direction

Plan for a future React Native application using the same domain model, application services, and JSON presentation definitions where practical.

Provide a separate native component registry and platform adapters for storage, navigation, location, and other device capabilities. Web components, browser APIs, and service workers belong in the PWA project. Validate a suitable native persistence adapter before assuming the browser PouchDB setup can be reused unchanged.

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
  mobile/                  # Future React Native application
packages/
  domain/                  # Domain types, identifiers, and membership model
  application/             # Use cases and platform-independent services
  ui-schema/               # JSON definitions, versions, and validation
  storage-pouchdb/          # Local persistence adapter
deploy/                    # Static hosting now; backend deployment later
```

The PWA and shared packages are scaffolded; mobile and API directories contain documentation placeholders. Add further directories with their implementation. Keep platform-specific renderers in their application until shared code has a demonstrated consumer.

## Delivery phases

The [phased roadmap](../product/roadmap.md) defines delivery phases 0–5 and their acceptance gates. The [use cases](../product/use-cases.md) define the goals and definitions of done for day-trip planning, multi-day trip planning, daily process, and observation reporting.

The current local-only PWA is an initial foundation, not a completed Phase 0 or Phase 1. API and native applications still need runnable foundations. The PWA remains independent of the API.

Phase 1 introduces local SQLite and basic synchronization. Before implementing them, record the storage and synchronization design, including native/browser differences, attachment handling, migrations, conflict resolution, and how SQLite relates to the planned CouchDB backend. The existing browser PouchDB adapter does not satisfy the SQLite or reproducible migration requirements.
