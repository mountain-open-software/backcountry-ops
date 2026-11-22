# Documentation

- **On-device AI and history:** [Optional local model, voice support and private note status](architecture/on-device-ai.md) documents default-off downloads, space/battery controls and native build requirements.

- **Mobile parity:** [Native and mobile PWA experience](architecture/mobile-experience.md) defines shared screens, navigation and feature availability at every window size.
- **Design system:** [Shared tokens and Material components](../packages/design-system/README.md) defines the common web/native foundation and accessibility checks.
- **Expo native app:** [Run and verify iOS/Android](../projects/mobile/README.md) describes native SQLite, recordings, backup/restore, and device-test limits.
- **Implemented solo version:** [Feature and limitation guide](product/solo-version-implementation.md) describes the current React/TypeScript app and verification.
- **Product:** [Open Mountain product vision v2.0](product/vision.md) describes the purpose, principles, product directions, and priorities.
- **Agreed plan (plain text):** [Daily-process plan](product/daily-process-plan.txt) consolidates decisions from the product discussion.
- **Use cases:** [Initial use cases](product/use-cases.md) sets the delivery order: day-trip planning, multi-day trip planning, daily process, then observation reporting.
- **Human-factor assessment:** [Private reflection and group discussion](product/human-factor-assessment.md) keeps personal assessments private to their author.
- **Strategic mindsets:** [Operating-posture vocabulary](product/strategic-mindsets.md) distinguishes core mindsets, extensions, and personal readiness.
- **Avalanche assessment:** [CMAH product structure](product/avalanche-hazard-assessment.md) defines problem type, location, likelihood, size, and individual/group assessment requirements.
- **Leadership and human factors:** [Product requirements](product/expedition-leadership-human-factors.md) defines self-guided/guided roles, shared responsibility, the seven-stage daily process, and human-factor use cases.
- **Voice and events:** [Primary interaction and state architecture](architecture/events-and-voice.md) covers voice-first input, event-driven projections, and single-phone unanimous approval.
- **Community model:** [Communities, groups, and linked day trips](architecture/community-trip-model.md) defines trip composition, memberships, roles, and privacy boundaries.
- **Local first version:** [API-free scope](product/version-one-local.md) records username-profile setup, proposed local workflows, and unavailable server features.
- **Roadmap:** [Delivery phases 0–5](product/roadmap.md) defines deliverables, acceptance gates, and current foundation gaps.
- **Next-phase collaboration:** [CouchDB users, passwords, and security](architecture/couchdb-collaboration.md) describes authenticated collaboration after solo delivery.
- **Database scopes:** [User and community databases](architecture/database-scopes.md) defines offline ownership, sync scope, and server AI boundaries.
- **Review resolutions:** [Confirmed product decisions](architecture/review-decisions.md) records trip moves, separate user/community databases, and leader-approved/revised summary history.
- **Pre-implementation review:** [Process and architecture findings](architecture/process-architecture-review.md) lists blockers, open decisions, recommended implementation order, and acceptance scenarios.
- **Repository review:** [Structure findings and follow-up work](architecture/repository-review.md) explains the workspace improvements and remaining gaps.
- **Architecture:** [Monorepo structure proposal](architecture/monorepo.md) describes the intended repository layout and boundaries.
- **Application architecture:** [Local-first PWA and future platforms](architecture/application.md) covers Vite, React, JSON rendering, PouchDB, users and organizations, and the later React Native and CouchDB work.
- **Decisions:** [Architecture decision records](architecture/decisions/README.md) will capture accepted technical decisions and their rationale.

Keep cross-project documentation here. Keep implementation-specific setup and usage instructions alongside each project or package, and link them from this index as they are added.
