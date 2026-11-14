# Event-driven state and voice-first interaction

Status: Required direction; not implemented by the current PWA

## Primary interaction

Voice-to-text is the primary way to use the application. A user speaks an observation, assessment contribution, plan change, decision, or group approval; the app transcribes it, prepares a structured action, and records the corresponding event. Forms remain optional for targeted edits, such as correcting one location, value, or sentence. Typed fallback remains available when speaking is impractical.

Retain the original recording where available, transcript, extracted draft, author/recorder, and relationships to resulting events according to permissions and retention policy. Distinguish the time something happened from when it was recorded. Unsupported or ambiguous instructions remain drafts for clarification rather than silently changing domain data. Voice extraction cannot bypass domain validation or participant privacy.

Recording capture, accepted events, and existing data must work offline. Local/device transcription should be evaluated; if transcription requires a network provider, retain queued audio and show transcription as pending. Do not claim an offline transcript exists or block field capture while waiting for AI. A confirmed manual correction can complete a pending action without remote transcription.

## Route and track boundary

No live GPS track recording or route drawing is implemented or planned in Open Mountain. Use file uploads and external links for both planned routes and actual tracks. Provider-specific API connections are not assumed. Imported data retains source, original file, planned/actual classification, and trip/day associations. Observation point-location metadata is separate and remains permission-dependent. Record imports, link changes, and corrections as events. External links alone do not provide offline content.

## Automatic context and visible timeline

Capture available user, trip/day, time, GPS/accuracy, and evidence context automatically as specified in [observation reporting](../product/use-cases/observation-reporting.md#automatic-context-capture). Respect permissions and platform limits, preserve missing/stale indicators, and keep sensor-derived context distinct from user-reported facts. Voice-first input does not imply continuous ambient audio recording.

The OperationalDay timeline presents accepted events, including late observations and corrections after closure. Recorded time establishes when the update entered the system; event/observation time remains separately visible. Preserve actor, action, affected records, previous values, and source lineage. Projecting updated state must not erase the original event or hide a later correction by backdating it.

## Events are the source of state changes

The system records domain events and updates application data from those events. Forms and voice submit commands through the same validation and event path; neither directly overwrites projected state.

1. Capture the user's input and prepare a command/draft.
2. Validate its scope, permissions, references, values, expected revision, and applicable approval rules.
3. Persist an accepted event durably with a stable identifier.
4. Apply it through a versioned reducer/projector to update the read model.
5. Show success only after durable acceptance; recover/replay if projection is interrupted.

An event includes event/schema version, event ID/type, community and owning trip/OperationalDay, recorder/actor, event time, recorded time, command/idempotency identifier, affected entity identifiers, expected revision where relevant, and payload or protected evidence references. Record the difference between the person entering an event and people whose responses that event reports.

Event examples: plan revised, observation recorded/corrected, individual assessment recorded, group proposal generated/revised, unanimous approval recorded, approval superseded, group split, and field report revised. Final names and contracts require a domain decision.

Reducers must replay deterministically, apply the same event only once, and produce equivalent state after restart. A correction is a new event referencing the prior record/event. Define event version migration, causal ordering, concurrent changes, projection checkpoints, and privacy-aware retention/deletion before production use. This design does not require a particular event-store framework, API, or backend.

Private human-factor content must not be placed in a group-readable event payload. Protected personal event storage and permitted references need explicit boundaries. Synchronization and exports must retain those boundaries; durable history does not mean retaining sensitive data forever without a deletion policy.

## Unanimous group approval on one phone

Everyone in the applicable participant roster must approve the exact combined proposal version. A single phone may record that the group reviewed and unanimously approved it; separate devices, accounts, and individual taps are not required.

The approval event records:

- OperationalDay, proposal ID/version, and the participant-roster version being approved.
- Every participant's reported approval, including the leader's, with no missing participants or assumed assent.
- The recorder and recording method, for example voice-recorded group approval on a shared phone.
- Event/recording times, evidence references where captured, and the expected current proposal revision.

A single event may contain all participant approvals and transition the proposal to accepted. This represents the recorder's attestation of the group's explicit approval, not proof that each person independently authenticated, spoke, or signed on a separate device. Voice transcription is not speaker identity verification.

“I approve” alone is insufficient to infer the whole group's consent. If unanimous approval is stated but the intended proposal or roster is ambiguous, resolve that before acceptance. A rejection, unresolved response, or missing participant keeps the proposal pending. Approval never overrides a person's choice not to participate.

Initial acceptance of the combined assessment and plan requires unanimous approval. Thereafter, approval authority depends on the change's relationship to that agreement, not merely whether a field changed.

## Field changes and delegated leader approval

- **Within the agreed plan:** The leader may approve and record execution of a previously agreed alternative or response under its agreed trigger conditions. For example, switching to Plan B when the agreed condition occurs does not require another unanimous vote.
- **Against the agreement:** A proposed departure from the agreed objective, terrain limits, turnaround criteria, alternative, trigger conditions, or other decision constraints requires everyone's approval of the revised proposal. Leader approval alone cannot authorize it.
- **Unclear scope:** If the proposed change cannot be shown to fall within the agreement, leave its authority unresolved and obtain group approval rather than automatically treating it as delegated.

A leader approval event references the accepted agreement/version, relevant trigger, supporting observation or event, chosen action, rationale, and leader/recorder. It records delegated execution; it does not rewrite the original group agreement or fabricate fresh participant approvals.

A departure proposal records the changed terms and obtains unanimous approval against its exact version and applicable roster, which can be captured on a single phone. Until that event is accepted, the proposed departure is not shown as approved. Changes in participation require explicit roster events and reconciliation of approval scope; a person cannot be removed merely to bypass their disagreement.

A copied day retains approval history as a historical snapshot. Subsequent actions must be checked against the applicable agreement and actual group context rather than treating copied approvals as new responses. Record proposal revisions, authority decisions, leader approvals, group approvals, and resulting state updates as events. No approval prevents a participant from declining, stopping, or raising a concern.

## Individual and team debrief events

Support individual debriefs and a team debrief, or both. A team conversation can be recorded from one phone and identifies its recorder and actual participants. Individual debriefs retain their authorship; private human-factor sections remain isolated. Completion events identify the debrief format and version rather than assuming a single leader-authored document. The leader reviews the available records and actual participants and confirms debrief completion; do not invent attendance or personal contributions.

## Day completion events

Field reporting means each person recording their observations, not a separate narrative document. Observation events preserve observer and recorder attribution. Each participant explicitly submits their own report or nothing-to-add response as an event tied to the applicable day roster and submitted revision. No observations does not automatically mean finished.

At day closing, AI summarizes submitted reports into a separately versioned, evidence-linked record without changing originals or accessing private human-factor inputs. Record generation, failures, and revisions as events; summary approval remains unresolved. Pending or failed generation never blocks day completion once all participant submissions and the debrief are complete. Persist the generation request offline and retry when processing is available; later generation records a new event without reopening the completed day.

Record debrief completion and field-reporting completion independently for each OperationalDay. The assigned leader must explicitly confirm day closing through an attributable event referencing the roster, submissions, and debrief records. Neither the last submission nor a debrief event automatically closes the day. A day can transition to complete only when the leader confirms closure and both prerequisites are done; return from the activity or completion of one item is insufficient. Persist the actor, timestamps, and affected versions, and enforce the same rule through commands and replay. Copied group days complete independently. Participants may add or correct observations after closing without reopening the day. Corrections remain events preserving prior versions and distinct observation/recording times. Mark affected AI summaries out of date and queue refresh against the updated observation revisions; retain prior summaries and source references, and prevent in-flight older summaries from appearing current. Completion does not imply publication or disclosure of private material.

## Definition of done

- Voice recording/transcription and structured extraction produce reviewable commands; forms perform targeted corrections through the identical event path.
- Offline audio capture and event acceptance survive interruption/restart; unavailable transcription is visible and recoverable.
- Replaying the same persisted event history reconstructs the same projected data. Duplicate command/event delivery does not apply a change twice.
- Interrupted projection recovers without losing accepted events or displaying an unaccepted command as committed state.
- Domain validation rejects invalid values, unauthorized actions, and stale approvals before event acceptance.
- A single-phone unanimous approval event accounts for the exact full roster and exact proposal version, preserving recorder attribution.
- Tests reject partial approval, ambiguous roster/proposal, and stale approval for departures or changed membership; they distinguish group attestation from independently authenticated approval.
- Tests permit leader approval of actions within agreed alternatives/triggers and reject leader-only approval of departures. Agreement references, rationale, and trigger evidence survive replay.
- Tests cover replay, idempotency, revisions/corrections, split lineage, private payload isolation, and export/import of permitted event history.

## Current implementation gap

The PWA currently uses forms and directly writes PouchDB documents. It does not yet implement voice capture/transcription, validated domain commands, an authoritative event log, replayable projections, or group approval events. PouchDB revision history alone does not satisfy these requirements.
