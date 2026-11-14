# Phased roadmap

Status: Planned; Phase 0 in progress

This roadmap defines phase deliverables and acceptance gates. The [use cases](use-cases.md) define the user outcomes and their detailed definitions of done. A phase is complete only when its acceptance criteria are demonstrated.

## Phase 0 — Architecture Foundation

Objective: Establish the technical foundations.

Deliverables:

- Monorepo.
- Development environment.
- Domain package.
- API foundation.
- Database foundation.
- Initial architecture documentation.
- Canonical domain model.
- Experience profile configuration.
- Open-source repository and contribution structure.

Acceptance criteria:

- Mobile, web and API applications run locally.
- Shared domain types are available.
- Initial domain entities have automated tests.
- Database migrations are reproducible.

## Phase 1 — Offline Field Recorder

Objective: Deliver the first useful field application.

Deliverables:

- User and trip management.
- Trip planning: [day trips](use-cases/day-trip-planning.md) and [multi-day trips](use-cases/multi-day-trip-planning.md).
- GPS tracking.
- Offline maps.
- Voice recording.
- Manual observations.
- Local SQLite storage.
- Local attachment storage.
- Basic synchronization.
- GPX export.

Acceptance criteria:

- A user can plan and execute a trip without connectivity.
- GPS tracks and observations are saved locally.
- Voice recordings remain available offline.
- Data synchronizes when connectivity returns.
- Exported data remains usable outside Open Mountain.

## Phase 2 — Weather and Recent Observations

Objective: Make environmental intelligence a core product capability.

Deliverables:

- Weather domain.
- Forecast integration.
- Weather observation forms.
- Weather station ingestion.
- Recent observation feed.
- Geographic and elevation filtering.
- Expected versus observed comparison.
- Daily weather summaries.
- Weather briefing interface.

Acceptance criteria:

- Users can view relevant recent observations.
- Forecast snapshots are preserved.
- Observations retain their source and location.
- Missing information is clearly identified.
- Weather comparisons respect location and time context.

## Phase 3 — Agentic Field Experience

Objective: Introduce AI capabilities into daily use.

Deliverables:

- Agent runtime.
- Agent registry.
- Tool contracts.
- Context management.
- Voice transcription.
- Structured observation extraction.
- Conditions summaries.
- Report generation.
- Audit and approval mechanisms.

Acceptance criteria:

- Voice recordings can produce draft structured observations.
- Original recordings remain preserved.
- Users can review and correct extracted data.
- Agents cannot bypass domain validation.
- Agent actions are auditable.

## Phase 4 — Professional Operations

Objective: Support structured professional workflows.

Deliverables:

- OperationalDay.
- Team management.
- Participant assignments.
- Operational briefing.
- Structured weather observations.
- Snow profiles.
- Stability tests.
- Avalanche observations.
- Professional assessments.
- Operational decisions.
- Daily operational reporting.
- Professional vocabulary and validation.

Acceptance criteria:

- Multiple teams can operate within one OperationalDay.
- Activities and observations can be associated with teams.
- Professional assessments and decisions are traceable.
- Professional and recreational modes share the same canonical domain model.

## Phase 5 — Ecosystem and Integrations

Objective: Establish external interoperability.

Deliverables:

- Avalanche Canada integration where authorized.
- CAA InfoEx adapter where authorized.
- External data source adapters.
- Satellite provider integration.
- Open APIs.
- Structured exports.
- Organization-level deployment.
- Data sharing and licensing controls.

Acceptance criteria:

- External integrations are isolated behind adapters.
- Data can be exported independently.
- External submissions are authorized and traceable.
- Organizations retain control of their information.

## Relationship to the current scaffold

The repository currently provides a local-only React/Vite PWA, browser PouchDB persistence, JSON screen definitions, shared JavaScript packages, basic local records, organization memberships, backup import/export, and initial automated checks. API and React Native directories are placeholders. Phase 0 is not complete: runnable native/API applications, a complete canonical model and shared type contracts, experience profiles, contribution guidance, and reproducible migration tooling remain to be delivered.

The PWA must continue to run without an API. Future locally runnable API services are optional for the web app; API availability must not become a condition for local field capture.

The Phase 1 SQLite requirement introduces a storage foundation beyond the current browser PouchDB adapter. Before implementing it, record an architecture decision covering native SQLite, web storage support, attachment storage, migration/versioning, and the synchronization contract with the planned backend. Do not assume SQLite replicates directly with CouchDB or that PouchDB schema versions already provide reproducible migrations.

Basic synchronization is a Phase 1 acceptance gate and requires a defined remote endpoint or peer transport. The initial local-only scaffold does not satisfy that gate. Offline capture remains independent of remote availability; synchronization is implemented and tested when that transport is added.

## Leadership and community requirements across phases

The [leadership requirements](expedition-leadership-human-factors.md) and [community/trip model](../architecture/community-trip-model.md) apply across phases rather than waiting for professional operations. Phase 0 must define community/group membership, trip participants and leader roles, linked day trips, day-specific daily processes and observations, self-guided/guided configuration, and privacy contracts in the canonical model. Phase 1 introduces offline group participation workflows with authenticated delivery deferred until a transport exists. Phase 3 agents must obey participant visibility, preserve evidence, and never decide for the group. Phase 4 extends the common daily lifecycle with professional vocabulary, teams, and responsibilities; it does not introduce a separate professional-only domain.

The seven human-factor use cases remain planned. Their definitions of done require tested privacy and delivery behavior before completion can be claimed. The current generic PWA forms, local profile switching, and all-data backup do not satisfy those requirements.
