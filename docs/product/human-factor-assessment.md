# Human-factor assessment

Status: Product requirements; not implemented

## Goal

Help each participant privately reflect on readiness, comfort, and influences on decision-making, while allowing the group to record practical concerns and responses raised during discussion.

## Visibility boundary

All other assessment sections are public to the authorized trip/group audience. Only the participant's own human-factor section is private. The combined group proposal and human-bias indicator are visible to everyone in the trip/group and require group review and approval. This boundary does not change separate recipient controls for safety concerns or authorize publishing trip data outside the group.

## Private individual assessment

Each participant's own human-factor assessment is private to that participant. The trip leader, other participants, community administrators, and report editors do not gain access through their roles. A purpose-limited AI assessment may read private summaries specifically to assess human-bias and group-dynamics risk. This does not grant the leader or other participants access to those summaries or to the original personal assessments.

Reflection prompts may cover:

- Fatigue, physical limitations, stress, and equipment concerns.
- Comfort with Plan A and Plan B, need for more information, or a choice not to proceed.
- Objective fixation, commitment bias, time pressure, social pressure, authority gradients, and reluctance to speak.
- Personal concerns and uncertainty about the proposed activity.

These are self-reflection prompts, not diagnoses. A human-bias risk score is distinct from a psychological diagnosis or an overall mountain-safety score. Strategic operating mindset and avalanche hazard assessment remain separate concepts.

## Group discussion and assessment

A participant can choose to raise a separate concern or contribute a statement during discussion without exposing their private assessment or personal explanation. For example, they may contribute “I need a shorter day” while keeping the reason private.

The trip leader records their own personal assessment under the same rules as every other participant: hazard sections are public to the trip/group and their personal human-factor section is private. The leader may contribute a public group-discussion record, but does not unilaterally approve the combined group assessment. Public means visible to the intended trip/group audience, not automatically published on the internet. Private assessment content and private summaries are not included. Not disclosing a private response is not consent to proceed.

## Purpose-limited AI human-bias assessment

AI may read private summaries to assess potential human bias and group-dynamics risk, such as commitment pressure, objective fixation, authority gradients, or suppressed disagreement. This is a specific exception to excluding private material from AI processing; it does not permit general group summarization, report generation, unrelated profiling, or unrestricted access to raw private notes.

The output is a human-bias risk score/indicator, a distinct component within the group-reviewed proposal, separate from avalanche likelihood/size, strategic mindset, competence, and any overall safety judgment. It does not authorize a route or override concerns. Missing input is unknown, not low risk. Model inference is uncertain and must not be presented as a factual diagnosis of a participant.

The human-bias risk indicator and AI combined proposal are visible to everyone in the trip/group, including the leader. The score format, explanation detail, and thresholds remain open product decisions. Group approval requires every participant to approve and may be recorded from a single phone as an event. Do not label a draft approved or expose privacy-sensitive explanations before the approval and privacy checks are defined. Private quotations, identities, counts, or explanations that reveal individual responses must not leak through the output, especially in small groups.

Before enabling this processing, make its purpose and data access clear to participants and define consent, local/provider processing, retention, and audit controls. No AI inference is required to save a private assessment or run the daily process offline.

## AI proposal, group review, and approval

1. Each participant, including the leader, records their personal assessment. Public hazard sections and private human-factor sections retain their distinct access rules.
2. AI prepares a combined proposal from public assessments and discussion contributions. Only its dedicated human-bias risk process may read private human-factor summaries; it contributes a privacy-preserving indicator rather than raw/private content to the proposal.
3. Everyone in the trip/group can inspect the proposed assessment, human-bias indicator, rationale based on public evidence, uncertainty, missing inputs, and unresolved differences.
4. The group reviews, discusses, and corrects the proposal. Preserve the original AI proposal, human revisions, and attribution.
5. Record participant approval responses against the exact proposal version. Approval is a group action; the leader's personal approval does not stand in for the group.
6. Mark the combined assessment accepted only when the agreed group approval rule is satisfied. Pending, rejected, or superseded proposals remain distinguishable from accepted assessments. Every participant must approve, including the leader. One recorder may enter the group's explicit unanimous approval from one phone as a single event containing the full participant roster and exact proposal version. This records group attestation rather than separate authenticated signatures.
7. Changes that go against the accepted agreement require a revised proposal and unanimous approval. The leader may approve actions within the agreed plan, alternatives, and trigger conditions, recording the authority and rationale as events. See the [field-change approval rules](../architecture/events-and-voice.md#field-changes-and-delegated-leader-approval). Neither approval nor a vote overrides a participant's choice not to proceed.

AI is optional: offline capture and a manually prepared group proposal remain possible without a provider. A missing AI indicator is displayed as unavailable, never as low risk. Proposal generation, revisions, review responses, acceptance, and supersession are recorded as events and preserved in day history.

See [event-driven state and voice-first interaction](../architecture/events-and-voice.md) for durable event handling and the single-phone unanimous-approval contract. Voice-to-text is primary; targeted form edits are optional.

## Definition of done

- Private assessments can be created/revised offline in the owning user's database, retaining author and OperationalDay context. AI runs on the server when available; private records never enter the community database.
- Only the participant can access the private assessment through application features. Leader/admin/editor roles do not override that restriction.
- Group views, reports, exports, and synchronization to other participants exclude private assessment content and private summaries. General group AI context excludes them; only the purpose-limited human-bias assessment may read private summaries.
- The leader can record a personal assessment with the same public/private boundaries as other participants; role assignment grants no access to their private sections.
- Everyone can view the privacy-preserving AI human-bias indicator and combined proposal. The combined assessment becomes accepted only after recorded group review and approval, not merely leader action or AI generation.
- Tests verify visibility to all group participants, private-section isolation including the leader, proposal versioning, group approval enforcement, approval scope for revisions and delegated field actions, and missing-input behavior.
- Tests verify that the dedicated AI path receives only permitted summaries, cannot repurpose them for reports or unrelated profiling, and does not leak private inputs through its score, explanations, logs, or errors.
- Define and validate scoring format, uncertainty, missing-input behavior, and processing consent before exposing scores.
- Individual private history remains in the owning user database and is never exposed through the community day event stream.
- A separately raised concern has its own recipients and provenance without automatically copying private notes.
- Automated tests cover cross-user access denial, role escalation attempts, reports/exports, user/community database boundaries, event metadata, synchronization scope, and separation of private reflection from group discussion records.

## Implementation boundary

Each user has a separate database for private human-factor data, with a local version available offline. Each community has its own database for shared trip/day data. Scope synchronization by owning user ID or community membership, with future server authorization enforcing that scope. AI runs on the server and reads only permitted private summaries for human-bias assessment. No PINs are introduced.

Local database separation and user filtering are the initial application isolation model, not encryption against direct access to shared browser storage. Keep private events, recordings/transcripts, attachments, and backups in the user scope rather than the community scope. User/session mapping, database naming, recovery, and remote authorization still need concrete contracts. See [decision D2](../architecture/review-decisions.md#d2--separate-user-and-community-databases) and the [database scope plan](../architecture/database-scopes.md).
