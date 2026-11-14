# Use case 3 — Daily process

Priority: 3  
Status: Planned; basic local daily records implemented

## Goal

A user can follow a repeatable daily cycle: review current information, record expectations, prepare a plan or briefing, capture changes during the day, and close the day with a traceable review. When a group splits, copying the OperationalDay gives each group its own daily process.

## Actors and context

Initially, a local user works in one active organization. Later, authorized organization members may coordinate teams, assignments, assessments, and decisions. Local profiles do not imply authenticated collaboration.

## Community and group context

A community (the existing organization workspace) contains groups and trips. Users may participate in multiple communities and groups. Trip participants and trip-leader assignments are explicit; leadership coordinates the group rather than transferring all responsibility or implying professional authority. Self-guided is the default; guided mode uses explicitly configured responsibilities.

Every day trip, including one linked to a multi-day trip, owns its daily process and observations. See the [community and trip model](../../architecture/community-trip-model.md) and [leadership requirements](../expedition-leadership-human-factors.md).

## OperationalDay ownership

A trip owns its OperationalDays, whether it is single-day or multi-day:

- A single-day trip starts with one OperationalDay; a group split creates an additional day record by copying it.
- A multi-day trip starts with an OperationalDay for each trip date, including rest days; separate groups may have distinct OperationalDays on the same date.
- Each OperationalDay belongs to exactly one owning trip and contains that day's daily process, observations, activities, assessments, concerns, decisions, and debrief.
- When the group splits, copy the OperationalDay and assign participants and a trip leader to each resulting group/day. Both records belong to the same trip and may have the same date; their subsequent changes are independent.
- Linked day-trip itinerary views resolve to the corresponding OperationalDay; they must not create a second daily process or duplicate observations.

The trip holds overall objectives and itinerary. The OperationalDay holds the dated preparation, briefing, execution, reassessment, and review. A multi-day summary aggregates its days without replacing their records.

## Copy a day when the group splits

1. The first group continues using the original OperationalDay without resetting its progress or history.
2. At the split, create a full point-in-time copy for the second group within the same trip and date. Copy everything recorded at that point: plan, route, briefing, participants and roles, readiness, assessments, concerns, decisions, observations, evidence/attachments, process state, field reports, and event history.
3. Give the copied day and its independently editable records new identifiers. Preserve source identifiers, source versions, original authorship/event times, and the split/copy time and actor. Attachment bytes may be reused through immutable references provided they remain available offline independently of later source changes.
4. Record the split/copy event and any subsequent participant or leader changes. Existing readiness, decisions, and acknowledgements remain historical facts at their original times; copying does not represent a new response or fresh acknowledgement.
5. Each group then records its own events, observations, decisions, daily-process updates, and field report. Later changes to either day do not automatically update the other.

Everything in the source day is included in the snapshot; copying retains existing participant-controlled visibility and recipient permissions rather than granting the second group new access to private material. Copied history is identified as inherited, not as newly performed work.

### Recorded events

Expose recorded events in the OperationalDay timeline. Show post-close additions and corrections after the closing event at their recorded time, retaining the original event/observation time as separate context. Users can inspect what changed, who recorded it, and the prior version; an edit does not silently erase timeline history.

Record the split and subsequent changes with stable event identifiers, owning day, actor, event time, recorded time, affected record identifiers, and source lineage where applicable. Record plan revisions, role/participant changes, observations, decisions, process transitions, and field-report revisions. Corrections retain the prior event history rather than silently rewriting it. This requirement does not prescribe a particular event-sourcing framework.

Shared pre-split events and evidence retain their original provenance. A combined trip report can distinguish inherited history from each group's post-split events and must not count the same original observation twice simply because it appears in both snapshots.

### Definition of done for a split

- Copying works offline and captures a consistent source state at the split, including records and attachments. A failed or interrupted copy is not presented as a complete day.
- The original day continues unchanged apart from the recorded split event; its existing field report and progress are preserved.
- The second day contains the full state and historical events recorded at the split, with copy lineage and unchanged visibility rules.
- Later events and field reports belong to their respective group days and remain independent after restart, export/import, and eventual synchronization.
- Automated checks verify complete snapshot copying, consistent handling of concurrent source edits, independent later edits/deletions, preserved authorship and event times, attachment availability, access rules, and prevention of double-counting inherited observations in aggregated reports.

## External routes and tracks

Participants use their own navigation and tracking apps. Planned routes and actual tracks enter Open Mountain only by upload or external link, for example Strava or Outmap. There is no in-app live GPS tracking or route drawing. Preserve source and day linkage; uploaded data can support plan-versus-actual review, while links alone do not guarantee offline access.

## Voice-first interaction and event-driven state

Voice-to-text is the primary interaction for briefing contributions, field reports, plan changes, and approval. Forms are optional for targeted corrections. Every accepted action is recorded as an event, and application data is updated from those events. See [event and voice architecture](../../architecture/events-and-voice.md) for validation, offline capture, replay, and privacy requirements. These capabilities are planned; the current form-based PWA does not implement them.

## Workflow

1. **Collaborative preparation:** Confirm the day trip, objectives, alternatives, group capabilities, equipment, turnaround criteria, communication, and emergency arrangements. Check that the plan suits the whole group.
2. **Morning conditions update:** Review new information independently before group discussion; distinguish reconsideration from seeking confirmation of the original objective.
3. **Shared assessment and planning:** Discuss hazards, exposure, uncertainty, readiness, fatigue, capabilities, and alternatives. Invite quieter participants to contribute.
4. **Group briefing:** Confirm the objective, route, timing, roles, operating limits, emergency arrangements, and readiness. Every participant can ask questions or raise concerns.
5. **Field execution and reassessment:** Record observations and revisit the plan at consequential decision points. Consider commitment pressure, fatigue, and whether everyone can speak freely.
6. **Group debrief:** Compare expected conditions with actual observations and the planned activity with what happened. Discuss human factors at play, what the group did well, and what needs to change, without assigning blame.
7. **Shared report and next-day preparation:** Consolidate authorized evidence and lessons. Participants contribute; designated editors manage publication. Carry authorized lessons into the next linked day trip while retaining private reflections.

## Assessment visibility

All assessments are public to the trip/group except the personal human-factor section. Individual avalanche/hazard assessments, their evidence and uncertainty, strategic mindset proposals, and the combined group assessment are visible to trip participants; independence means each person forms their assessment before reviewing others, not that those assessments remain confidential.

The exception is each participant's personal human-factor section. It stays private to its author. The leader has their own personal assessment under the same privacy rules as everyone else. AI creates a combined proposal, including a human-bias indicator visible to all participants; the group reviews and approves the exact version before acceptance. AI may read private summaries only to assess human-bias/group-dynamics risk under the purpose limitation below. Public means the authorized trip/group audience, not internet publication or external sharing.

## Human-factor assessment privacy

Each participant's [own human-factor assessment](../human-factor-assessment.md) is private to them. Leader, community membership, or report-editor roles do not grant access. The leader contributes their own assessment and may record the public discussion. AI prepares a public combined proposal without exposing private responses; everyone in the trip/group reviews it and group approval is required before acceptance. A dedicated AI human-bias assessment may read private summaries solely to produce a human-bias/group-dynamics risk indicator; its audience is everyone in the trip/group, while its score format remains to be defined. This exception does not allow general AI reports to read private summaries. Copying a day preserves these restrictions; private content is not exposed through copied records, events, reports, exports, or group AI context.

## Morning briefing: objectives, mindset, plans, and assessments

The morning process must capture:

1. **Objective for the day:** What the group wants to do or achieve, distinct from the route chosen to achieve it.
2. **Strategic mindset:** Record the day's operating posture using the [strategic mindset vocabulary](../strategic-mindsets.md), with rationale, evidence, terrain implications, and change triggers. This is distinct from personal readiness, mood, and human-factor reflections. Individual mindset proposals can differ from the selected group posture.
3. **Plan A — where we go:** The intended destination, route/terrain, timing, and relevant hazards, with the supporting conditions information and uncertainty.
4. **Plan B:** A concrete alternative destination/route or course of action, with its hazards and limitations. It must not be labeled safe simply because it is an alternative.
5. **Conditions that trigger a plan change:** Explicit observed or expected conditions, thresholds where appropriate, or timing/readiness concerns that cause the group to reconsider Plan A. Record the intended response, such as reassess, switch to Plan B, turn back, or stop; a trigger is not an automated safety decision.
6. **Individual hazard assessments:** Each participant independently records their assessment of the proposed plans and conditions before viewing the combined assessment. For avalanche hazards, use the [four-question CMAH structure](../avalanche-hazard-assessment.md): problem type, location, likelihood, and destructive size for each problem. Preserve author, time, relevant plan/briefing version, evidence, uncertainty, and concerns. Unsubmitted or unavailable responses remain explicitly missing.
7. **Combined group assessment:** Bring together the public individual hazard assessments, discuss agreement and differences, and record the group's assessment, selected plan, rationale, and unresolved concerns. Combining does not average hazard ratings, erase disagreement, or imply that every participant agreed to proceed.

The leader facilitates the discussion. Participants retain their own assessments and their choice not to participate. Revising the plan or the combined assessment records an event and preserves the versions used in the briefing. In the field, observations can be linked to a plan-change trigger and to the resulting decision.

### Proposal review and approval

The [human-factor assessment workflow](../human-factor-assessment.md#ai-proposal-group-review-and-approval) defines the proposal lifecycle. The combined assessment is a versioned proposal, not an automatically accepted AI conclusion. Everyone can review the proposal and human-bias indicator. Record group approvals, dissent, corrections, and missing responses; initial acceptance and changes against the agreement require unanimous approval. The leader may approve changes within the agreed plan and conditions, including a pre-agreed switch to Plan B. Every participant, including the leader, must approve a departure from the agreement. A single phone may record an event attesting to unanimous group approval of the exact proposal and roster version; separate-device approval is not required. Missing, negative, or ambiguous responses keep the proposal pending. Manual proposals remain possible without AI or connectivity.

### Field-change approval

The leader may approve an action within the agreed plan, alternatives, and change-trigger conditions. Going against what the group agreed requires everyone to approve the revision, which can be recorded on one phone. Record both kinds of approval as events, referencing the original agreement, applicable conditions, supporting observations, and rationale. Do not overwrite the original decision or represent a leader approval as unanimous consent. See [detailed authority rules](../../architecture/events-and-voice.md#field-changes-and-delegated-leader-approval).

Acceptance checks distinguish an agreed Plan B transition from a departure beyond agreed limits, require unanimous approval for the latter, and preserve both histories through offline restart and replay.

### Morning briefing definition of done

- Unanimous approval can be recorded on one phone, primarily by voice, with recorder, full roster, proposal version, reported responses, and timestamps retained in the approval event.
- Accepted events update the read model; targeted form corrections use the same domain validation and event path. Replay/idempotency and interrupted-write recovery are tested.


- Objective, mindset contributions, Plan A with hazards, Plan B with hazards, and explicit plan-change triggers can be recorded and reopened offline for the OperationalDay.
- Strategic mindset uses a versioned operating vocabulary rather than a psychological score; individual proposals and the group selection remain distinct.
- Avalanche assessments support multiple problems with separate type, location, likelihood, and size estimates; missing information is explicit. Other mountain hazards retain their own appropriate structure.
- Each participant can privately reflect on readiness, comfort, and human factors; the group cannot view or automatically combine those private records. Group discussion contributions are separate records. The leader has a personal assessment like every participant. AI prepares a combined proposal visible to everyone; purpose-limited AI may use private summaries for human-bias risk assessment only. The group reviews and approves the proposal before it becomes accepted.
- Each participant can record an independent assessment; a leader's or group's assessment cannot silently stand in for a participant's missing response.
- The combined assessment references the versions of individual contributions it used. Original hazard assessments, differences, uncertainty, and unresolved concerns remain visible to the trip/group; personal human-factor content is excluded.
- Each trigger has a condition and intended response. A field observation, triggered review, and actual decision can be linked and retain distinct event times.
- A report distinguishes the original briefing from later changes, including which plan was selected and why it changed.
- Automated checks cover offline round trips, missing responses, participant visibility, assessment provenance, preserved disagreements, plan revisions, and trigger-to-decision links. No calculated group safety score or automatic declaration of safety is produced.

## Debrief content

A day supports **individual debriefs, a team debrief, or both**. Each participant can record their own debrief. When the group discusses the day together, for example in the car, a recorder can capture one team debrief on a single phone. Do not require separate phones or duplicate personal entries merely to capture a shared conversation.

Individual debriefs retain their author and day context. The personal human-factor section remains private; other assessment content follows the trip/group visibility rules. A team debrief records the recorder, participating people, time, and the discussion's day/group context. It does not claim absent participants attended or convert private personal reflections into public discussion.

Both formats use the same five questions:

1. **Expected versus observed:** What conditions did we expect, and what did we actually observe? Link the original forecast/assessment snapshots and field observations; identify missing evidence rather than filling gaps retrospectively.
2. **Planned versus actual:** What did we plan to do, what did we actually do, and why? Reference routes, timing, plan changes, decisions, and recorded events.
3. **Human factors at play:** What influenced our communication and choices—for example fatigue, time pressure, objective fixation, speaking up, or constructive disagreement? Record what participants choose to discuss, without exposing private personal assessments or diagnosing individuals.
4. **What we did well:** Which actions, observations, decisions, and group practices should we retain?
5. **What needs to change:** What should we do differently next time or tomorrow? Record actionable lessons, and responsibility/follow-up where the group identifies them.

The application can prepare an evidence-linked draft from permitted events and observations, primarily for voice-led review and correction. The debrief is for learning, not blame or retrospective claims that an outcome proves a decision was safe. A missing observation or undisclosed personal reflection must not be presented as agreement or absence of a problem.

### Debrief definition of done

- All five topics have a recorded response or an explicit indication that the group did not discuss or could not assess the topic. Blank fields alone are not treated as completion.
- Expected conditions reference the versions available when planning; actual observations retain source, location, and event time. The original expectations are not overwritten by hindsight.
- Plan-versus-actual comparisons preserve the original plan and link relevant changes and their rationale.
- Public human-factor discussion excludes private assessment content and private AI input summaries. Personal reflections remain separately protected.
- Positive practices and proposed changes are distinguishable and can be carried forward as lessons without automatically changing the next day's plan or approving it.
- Record individual or team debrief completion as an event against the reviewed version, with author/recorder and actual participants. Preserve individual and team records separately when both exist; a team record does not overwrite personal reflections. The field-report submissions remain a separate requirement for day completion.
- The leader confirms debrief completion before closing the day, reviewing the available individual/team records and actual participants. Do not infer that one personal debrief represents the group or create missing personal reflections on their behalf.
- Automated checks cover the five-topic structure, explicit missing information, evidence provenance, privacy, retained plan versions, and offline save/reopen/completion.

## Field reporting: individual observations

A field report is each person's recorded observations for the OperationalDay. Each person submits their own field report. It is not a separate leader-authored narrative or a publication step. AI summarizes the submitted reports at day closing; the summary is a derived record, not a replacement for individual reports. Each participant, including the leader, records observations primarily by voice, with optional targeted corrections. Accepted events update the observation records, preserving observer, recorder where different, location/time, evidence, and revision history.

The day's field reporting consists of these attributed individual observations. The debrief remains the separate group review of expectations, actual activity, human factors, successes, and changes. Public observations do not expose private personal human-factor sections. After a group split, new observations are attributed to the appropriate group's OperationalDay; inherited observations retain their pre-split provenance.

Each participant, including the leader, submits their own report through a recorded submission event identifying the participant, OperationalDay, and submitted observation/report revision. The leader cannot silently submit for everyone. Merely saving observations is not submission. A participant with nothing to add can explicitly submit that outcome; a missing submission remains pending and never means no hazards or agreement.

At day closing, AI summarizes the submitted individual reports. The summary references the exact submitted revisions, preserves source attribution, important differences, uncertainty, and missing information, and excludes private human-factor content and private summaries. Individual observations, evidence, and submissions remain unchanged and available alongside it. Summary generation/failure/revisions are recorded as events. A pending or failed AI summary does not block day completion. The day can close offline once everyone has submitted and the debrief is done; summary generation remains queued until processing is available. Approval requirements for the closing summary remain open.

## Day completion

An OperationalDay is complete only when **both its debrief and individual field reporting are done**. Field reporting means each person recording their observations, not completing a separate narrative report. Returning from the activity alone does not complete the day. Completing either item alone leaves the day open, with the outstanding item clearly displayed. Debrief may be individual, team, or both. The leader confirms that the debrief is done and explicitly confirms day closing; submissions and debrief events never close the day automatically.

- Record debrief completion and field-reporting completion as separate events, with actor, event/recorded times, and relevant observation/debrief references. Field reporting is finished when every participant in the applicable day roster has explicitly submitted their own report or a nothing-to-add response.
- At closing, request the AI summary from the submitted reports; show pending, generated, or failed status independently of individual submissions and debrief completion. Queue generation durably when offline.
- The leader may close the day even when the summary is pending or failed, provided the debrief and all required individual submissions are complete. Later summary generation does not reopen the day.
- Only the assigned leader can confirm day closing. Record an explicit day-closing event with leader, recorder where different, timestamps, applicable participant roster, individual submission references, and debrief references.
- Accept that event only when the debrief is confirmed done and every required participant has submitted their own report or explicit nothing-to-add response. Leader closing confirmation does not fabricate or replace those submissions. Replaying the events must reproduce that state; repeated events must not complete the day twice.
- After a group split, each group completes its own debrief and field report. One group's completion does not close the other group's day.
- Participants can add or correct observations after closing without reopening the day. Persist the change as a new attributable event, preserving prior values, original observation time, entry/correction time, and the day-closing event.
- A post-close observation change marks any existing AI summary based on older revisions as out of date and queues a refreshed summary. Keep earlier summary versions and their source revisions; generation failure does not reopen the day. If a summary request is already pending, ensure processing includes the new accepted revisions or visibly queues a later refresh.
- Completion does not automatically publish observations, share private human-factor content, or imply approval of every decision made during the day.

### Completion definition of done

- The UI distinguishes debrief pending, participant submissions pending, AI summary pending/generated/failed, and day complete. Each participant's submission status is explicit.
- A completion command requires explicit assigned-leader confirmation and is rejected if the debrief or any required participant submission is unfinished; offline event persistence and replay preserve the same result.
- Tests reject non-leader closure and automatic closure after the final submission, and preserve leader/recorder attribution through offline replay.
- Tests cover both completion orders, missing participant submissions, explicit nothing-to-add submissions, duplicate events, restart/replay, and independent completion of copied group days.
- Tests verify post-close additions/corrections, preserved original evidence and correction history, unchanged closed status, and stale-summary detection/refresh against exact input revisions.
- Tests verify offline closure with a queued summary, persistence of the queue after restart, later generation without reopening the day, and failure/retry without losing submissions.
- Tests verify that the AI summary uses submitted revisions only, retains attributable differences and uncertainty, preserves originals, excludes private content, and displays provider failure/offline status without losing reports.

## Scope and boundaries

The local baseline is a daily planning and review record. Phase 2 adds weather expectations, observations, comparisons, summaries, and briefing presentation. OperationalDay is a shared foundation for both trip variants. Phase 4 extends it with multiple teams, participant assignments, professional assessments, decisions, and reporting.

Every day trip has a daily lifecycle/OperationalDay context. The initial generic daily record does not yet implement that relationship or the full professional workflow. Shared domain concepts must support both recreational and professional experience profiles.

## Definition of done

### Shared community and day-trip requirements

- The record belongs to an explicit community. Group participation, trip participants, and applicable trip-leader roles are visible and validated.
- Every day trip has its own daily process and observation collection, whether standalone or linked to a multi-day trip. Empty observations and an unstarted daily process are valid initial states.
- Participants can contribute assessments and raise concerns without leader approval. Individual choices to decline are not overridden by voting.
- Readiness, concerns, and human-factor reflections follow participant-controlled visibility in views, reports, exports, synchronization, and AI context.
- Tests verify day-trip linkage, role scope, organization boundaries, and privacy rules before these capabilities are marked complete.

### Local daily workflow baseline

- A user can create, reopen, edit, and delete a daily record with a date, title, information review, objectives/plan, briefing notes, and end-of-day review.
- Each OperationalDay has a stable identifier, one owning trip, and a local date in the trip time zone. Trip/date is not unique: copied group days have distinct stable identifiers.
- Single-day trips begin with one day; multi-day trips begin with one for each date in their range, including rest days. Group splits may add same-date copies.
- Observations and activities reference their OperationalDay without losing provenance.
- Changing trip dates requires explicit reconciliation of affected days; existing field records are not silently deleted or reassigned.
- Automated tests allow distinct same-date group days, reject duplicate identifiers and invalid cross-trip observation links, and verify independent edits after copying.
- Each record retains organization, author, schema version, and creation/update timestamps.
- Required fields and invalid references are rejected; references cannot silently cross organization boundaries.
- The complete local cycle works after an offline reload, persists after restart, and is included in export/import.
- Automated checks verify validation, organization scoping, linked records, persistence, and offline reopening.

### Phase 2 environmental review

- Expected and observed weather can be recorded separately and compared for an explicit location, elevation context, and time window.
- The briefing preserves the forecast snapshots and observation references used to prepare it.
- Missing, stale, and unavailable information is labeled; summaries do not invent values for missing inputs.
- Users can view relevant recent observations and a daily weather summary with source attribution.

### Phase 4 professional completion

- A group split creates separate OperationalDays by copying; each has explicit participants and a leader within the same trip and organization.
- Activities and observations are associated with the responsible team and OperationalDay within their owning trip; an OperationalDay does not contain multiple trips.
- Briefings, assessments, and decisions retain author, time, supporting evidence, and revision history.
- Professional vocabulary and validation are applied through the professional experience profile while retaining the shared canonical domain model.
- A daily operational report can be exported with its evidence references and decision history.
- Membership and authorization checks protect collaborative updates once a backend exists.

### Self-guided daily-cycle completion

- All seven stages can be recorded per day trip, including successive days of a multi-day trip, with plan/evidence references and accountable authorship.
- Independent assessments, readiness checks, concerns, checkpoint decisions, disagreements, and debriefs meet the linked human-factor use-case definitions of done.
- Shared reports exclude private material unless explicitly authorized; editor publication does not imply all participants agreed with every decision.

## Current implementation gap

The PWA currently creates, lists, deletes, and backs up daily records containing a title, date, and notes. Editing, structured daily stages, links to trips/observations, weather review, OperationalDay, teams, and traceable professional decisions remain unimplemented.
