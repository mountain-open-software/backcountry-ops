# Daily-process and architecture review before implementation

Status: Review complete; full workflow implementation is not yet ready. No application behavior is implemented by this review.

## Confirmed product decisions

The user-approved baseline is the [plain-text daily-process plan](../product/daily-process-plan.txt), expanded by the [daily-process use case](../product/use-cases/daily-process.md). Confirmed behavior includes:

- A trip owns exactly one OperationalDay per date. All participants record within that day. Separate operating groups require separate trips; the earlier same-trip split-copy design is superseded.
- Morning work includes objective, Plan A and hazards, Plan B, change triggers, individual hazard assessments, a combined proposal, strategic mindset, and human factors.
- Assessment sections are public within the trip/group except each person's personal human-factor section. A dedicated AI process may use private summaries only for the human-bias indicator visible to everyone.
- Initial proposals and departures from the agreement require unanimous approval. One phone can record explicit group approval. The leader may approve actions within the agreement.
- Voice is primary, targeted form changes are optional, and accepted events update application state and appear in the timeline.
- Routes/tracks are uploads or external links. Open Mountain does not record GPS tracks or draw routes.
- Each participant submits their own observations. Debriefs can be individual, team, or both. The leader confirms debrief completion and explicitly closes the day after submissions.
- AI summaries do not block offline closing. Observations may be added or corrected afterward without reopening the day, with visible timeline events.

These decisions should not be reopened merely because an implementation detail is unresolved. Recommendations below are proposals, not additional user-approved behavior.

## Resolution update

See [confirmed review decisions D1–D5](review-decisions.md): attaching an existing day trip is a confirmed move, private sections are offline-capable in separate user databases, communities have their own databases, AI runs on the server, and no PINs are required, and post-close changes automatically amend reports while approved and revised summary versions remain separate. The leader approves original/revised closing summaries. The later one-day-per-trip/date decision also supersedes the split design in R6. These resolve the product choices within R1, R2, R5, and R6; their exact persistence/identity contracts are still pending. Findings below retain the review's rationale and must be read with those resolutions rather than as unanswered alternatives.

Merge scope is resolved by D5: it is a coming-soon feature. Current destination-date conflicts must leave both records unchanged; merge algorithms and resolution UI are not prerequisites for the initial move flow.

## Findings in priority order

### R1 — High: Trip/day ownership still has two representations

Evidence: [community model — trip composition](community-trip-model.md#trip-composition) and [multi-day use case — local planning baseline](../product/use-cases/multi-day-trip-planning.md#local-planning-baseline).

The documents describe both real standalone day-trip records linked into a parent and day-trip views resolving to OperationalDays owned by that parent. Linking/unlinking an existing trip could therefore change ownership, leave two owners, or duplicate daily history. Moves must reject or explicitly resolve destination trip/date conflicts.

Recommendation: keep `Trip → OperationalDay` as the authoritative ownership rule already agreed. Before defining persistence, choose the exact representation of itinerary links, standalone-trip attachment, and unlinking. Define stable identity and lineage when an existing standalone trip is attached; do not treat a UI view as a second owning aggregate.

Acceptance gate: a worked example attaches an existing day trip with observations, encounters a conflicting destination date, and unlinks it again, identifying exactly which IDs and references change and showing no lost/duplicated evidence.

### R2 — High: Shared-phone participation is not protected personal storage

Evidence: [human-factor privacy](../product/human-factor-assessment.md#private-individual-assessment), [implementation boundary](../product/human-factor-assessment.md#implementation-boundary), and [single-phone approval](events-and-voice.md#unanimous-group-approval-on-one-phone).

A recorder can attest to group approval on one phone, but that does not authenticate each participant or isolate their private notes. Current local profile switching and all-data backups cannot satisfy the promised privacy. User-private payloads must remain outside community databases.

Recommendation: separate public group events and protected personal content. Specify local unlock/session behavior, encryption/key ownership, private export/recovery, and exactly what one recorder can enter on another person's behalf. Single-phone approval attestation remains supported; it must not be reused as permission to read or submit another person's private assessment.

Acceptance gate: demonstrate two participants using the supported device arrangement, including user-scoped offline entry, public discussion, scoped synchronization, and backup, without access to one another's private content. Do not implement sensitive forms before this boundary is defined.

### R3 — High: AI privacy and bias scoring lack an output contract

Evidence: [purpose-limited AI assessment](../product/human-factor-assessment.md#purpose-limited-ai-human-bias-assessment).

A group-visible score can reveal a participant's private concern through small-group inference even without quotations. The score's format, input summary construction, missing-input behavior, recipient boundary, processing consent, provider access, and evaluation are undefined. Calling it privacy-preserving does not establish that property.

Recommendation: define a dedicated pipeline and an explicit output schema, uncertainty representation, and permitted explanation policy. Decide whether processing runs locally or through an optional authorized service. Test small-group and before/after output inference. Preserve the agreed distinction between human-bias risk and mountain safety; do not invent validated thresholds or clinical meaning.

Acceptance gate: documented data-flow examples identify every input, recipient, persisted artifact/log, retention rule, and output for normal, missing-input, and small-group cases. No direct client-embedded provider secret is permitted in the static PWA.

### R4 — High: The event model has no persistence/consistency contract

Evidence: [events as source of state changes](events-and-voice.md#events-are-the-source-of-state-changes) and [local persistence plan](application.md#local-persistence-now-synchronization-later).

The plan requires append, validation, idempotency, deterministic projection, and replay, while the current adapter directly mutates generic PouchDB documents. The documents do not select stream/aggregate boundaries, sequence/revision assignment, append concurrency, projection recovery, or a confirmed day move's durable commit boundary. Replicating CouchDB documents would not itself implement those guarantees.

Recommendation: write a storage ADR before implementing commands. Define expected revisions, idempotency keys, accepted versus rejected commands, event ordering independent of device clocks, projection checkpoints/rebuild, attachment commit handling, and fault recovery. Specify how browser PouchDB and future native SQLite implement the same application-facing contract; do not assume direct SQLite-to-CouchDB replication.

Acceptance gate: a design walkthrough and tests cover interruption after event append but before projection, duplicate delivery, stale approvals, concurrent edits, failed attachment write, and restart/replay with identical state.

### R5 — High: Post-close changes conflict with submitted-only summaries

Evidence: [individual field reporting](../product/use-cases/daily-process.md#field-reporting-individual-observations) and [day completion](../product/use-cases/daily-process.md#day-completion).

The summary must use exact submitted revisions, but a later observation correction is required to refresh it automatically. The correction may not belong to a submitted report revision. It is unspecified whether the original submission automatically extends to later edits or the participant must resubmit. An in-flight old summary can also complete after newer data arrives.

Recommendation: define submission revision semantics explicitly. Choose automatic report amendment versus explicit resubmission; preserve the old submitted version either way. Give each summary request a source-revision manifest and prevent an older job from marking itself current. Closing remains unchanged regardless of this choice.

Acceptance gate: submit revision 1, close offline, add/correct revision 2, generate summaries out of order, and identify which report revision is submitted and which summary is current without reopening the day.

### R6 — Resolved product rule; persistence gate remains: one day per trip/date

The user superseded the earlier same-trip group-split design. All participants continue recording on one OperationalDay per trip/date. Separate operating groups require separate trips. There is no split snapshot or inherited split approval/submission policy to implement.

Remaining architecture gate: enforce owning-trip/local-date uniqueness under offline retries, future concurrent creation, and moves of existing day trips. A query-before-insert check is not sufficient by itself. Choose the deterministic identity/append/conflict strategy with the storage contract and specify explicit handling of destination-date collisions without merging history silently.

Acceptance gate: repeated/concurrent creation produces one day; a confirmed move into a conflicting date does not create duplicates or lose observations; separate trips on the same date remain independent.

### R7 — Medium: Voice-first offline use has not been scoped by platform

Evidence: [primary interaction](events-and-voice.md#primary-interaction) and [automatic context](../product/use-cases/observation-reporting.md#automatic-context-capture).

Saving audio offline is feasible independently of transcription, but a browser cannot promise that speech recognition or background capture works offline across platforms. Private dictation on a shared phone can also be heard or stored in ordinary group audio. The roadmap places transcription in Phase 3 while the desired daily interaction is already voice-first.

Recommendation: specify browser/native capabilities and a first delivery target: offline recording, visible queued transcription, manual fallback, and explicit review for ambiguous high-impact commands. Keep private recording/transcription apart from public group recordings. Define duration, interruption, attachment limits, and quota behavior. Treat full local transcription as an evaluated capability, not an assumed browser feature.

Acceptance gate: flight-mode capture, microphone denial, app suspension, storage exhaustion, failed transcription, and correction of a misheard approval all preserve evidence without silently accepting an incorrect action.

### R8 — Medium: Lifecycle and authority need explicit state transitions

Evidence: [proposal approval](../product/use-cases/daily-process.md#proposal-review-and-approval), [field changes](../product/use-cases/daily-process.md#field-change-approval), and [day completion](../product/use-cases/daily-process.md#day-completion).

The rules are prose distributed across files. Day lifecycle, proposal acceptance, per-person submission, debrief completion, and summary job status are separate dimensions; a single status enum would conflate them. Delegation must reference agreed terms, not an AI guess that a change is acceptable. Leader replacement/unavailability and cancellation are not specified.

Recommendation: define independent state machines and a command/role matrix. Keep summary pending independent from closed day status. Record a leader's declared within-agreement rationale with its agreement/trigger references; do not ask AI to authorize departures. Decide leader reassignment/cancellation behavior without weakening the confirmed unanimous-approval and self-submission rules.

Acceptance gate: transition tables identify prerequisites, permitted actor/recorder, event, and resulting state for every implemented command, including rejection cases.

### R9 — Medium: Route/track import and offline-map scope remain incomplete

Evidence: [route boundary](events-and-voice.md#route-and-track-boundary), [multi-day input scope](../product/use-cases/multi-day-trip-planning.md#route-and-track-inputs), and [Phase 1](../product/roadmap.md#phase-1--offline-field-recorder).

Uploads/external links are confirmed, but supported formats, limits, date/segment mapping, attachment availability, and whether offline maps are an embedded viewer or delegated to external apps remain unspecified. A Strava/Outmap link cannot promise offline data or licensed access to its contents.

Recommendation: pick an initial import format and explicit validation/error behavior; document links as references unless authorized content is actually imported. Decide map-viewer scope separately. Do not add route drawing, live tracking, scraping, or provider API credentials to fill this gap.

Acceptance gate: import planned and actual files, preserve originals/provenance, reopen offline, export independently, and show clear unavailable-content behavior for a link-only route.

### R10 — Medium: Documentation has accumulated superseded rules

Evidence: the old community diagram placed observations alongside OperationalDay; the roadmap allowed multiple teams within one day before the final one-day-per-trip/date clarification; readiness text still assigned the public version to the leader rather than the AI-proposal/group-approval process. These stale statements have been aligned in this review.

Remaining documentation work: resolve R1 before declaring final entity relationships, confirm primary CMAH/mindset vocabulary sources, decide closing-summary approval, and distinguish early local delivery gates from the full Phase 0/1 roadmap requirements. Keep the plain-text plan as the confirmed decision summary and this review as the unresolved implementation register; recommendations here are not accepted ADRs.

## Recommended implementation sequence

1. Resolve ownership/link representation, event/storage contract, and shared-device privacy/identity design. Document proposed ADRs and accept them only after their concrete tradeoffs are decided.
2. Define canonical types, commands, events, state transitions, and permission boundaries; write behavioral tests from the agreed examples.
3. Implement a small local slice: trip/day creation, attributed observation events, timeline, durable persistence/replay, then report submission/debrief/leader closure. Support targeted typed input while preserving the common command path.
4. Add offline voice recording and attachment recovery, followed by transcription/extraction through an optional adapter. Both voice and typed edits use the same validated commands.
5. Add approval/delegation workflows and confirmed day moves after their revision/roster and date-conflict semantics are testable.
6. Add AI combined proposals and closing summaries with versioned evidence manifests. Enable private-summary bias processing only after R2/R3 are resolved and tested.
7. Add native and remote synchronization implementations against the defined contracts without making the PWA depend on an API. The existing roadmap's broader phase acceptance criteria still apply.

This is a recommended engineering order, not a replacement for the user-defined product priority or a claim that a partial slice completes Phase 0 or Phase 1.

## Minimum acceptance scenarios before claiming the daily process complete

| Scenario | Required evidence |
| --- | --- |
| Morning proposal on one phone | Full roster approves an exact version; recorder attribution is distinct from participant authentication |
| Agreed Plan B trigger | Leader action references accepted terms and observation; no fabricated new group approval |
| Departure from agreement | Leader-only approval rejected; unanimous response event required |
| Private individual assessment | Other profiles, group exports, event payloads, AI reports, and other users' database synchronization cannot disclose it |
| Bias processing unavailable | Private assessment still saves; indicator is unavailable, not low risk |
| Trip/date uniqueness | Retries/concurrent creation produce one day; moves reject unresolved date conflicts; separate trips remain independent |
| Offline day closing | Own reports submitted, leader confirms debrief and closes; summary remains queued |
| Late correction | Closed state preserved, timeline records change, report/summary revision rules are consistent |
| Replay/failure recovery | Duplicate events and interrupted projections reproduce the same accepted state |
| Imported route/track | Original and metadata retained offline; external link limitations visible; no in-app GPS recording |

## Review outcome

The agreed workflow is sufficiently clear to preserve and test as product requirements. It is not yet a complete persistence, identity, privacy, or event-contract design. Begin full implementation only after the relevant high-priority findings are resolved; do not fill these gaps through implicit decisions in React components. Current application and infrastructure changes from the preceding monorepo review remain separate from this documentation review.
