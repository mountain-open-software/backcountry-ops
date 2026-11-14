# Community, group, and trip model

Status: Proposed domain requirements; not implemented

## Ownership and participation

A community is the user-facing workspace for the existing organization concept. Initially map Community to Organization rather than maintaining two competing ownership systems. A community may contain multiple groups, standalone day trips, and multi-day trips.

Users can belong to multiple communities and groups. Membership expresses participation and access; it does not imply professional competence. A group brings participants together, while each trip records its actual participants and role assignments so changes to group membership do not silently rewrite historical trip participation.

A trip can associate one or more participating groups within its owning community. Direct trip participants need not be forced into a permanent group. Cross-community group participation and cross-community trip ownership are not assumed; future explicit sharing must define those permissions.

## Trip composition

```text
Community (Organization)
├── Memberships → Users
├── Groups → GroupMemberships → Users
├── Standalone DayTrips
│   ├── Participants and trip-scoped roles
│   ├── DailyProcess / OperationalDay
│   ├── Observations and activities
│   └── Assessments, concerns, decisions, and debrief
└── MultiDayTrips
    ├── Participants, groups, and trip-scoped roles
    └── Ordered DayTrip links
        └── Each linked DayTrip owns the same daily process and field records
```

A multi-day trip groups and links day trips rather than embedding duplicate daily records. Each day-trip link has a stable identity/order and references a real day trip. A day trip may stand alone or belong to one multi-day parent initially; reusing its route as a template is distinct from reusing the same execution record in multiple expeditions.

The parent and its day trips must belong to the same community. Link ordering and dates must be consistent with the multi-day date range. Rest days are represented by day trips/day plans explicitly marked as rest rather than by missing itinerary data.

Every day trip includes a daily process and observation collection, including every day within a multi-day trip. The daily process can be an unstarted draft and the collection can be empty. These are not replaced by one parent-level briefing or a shared observation list. Multi-day summaries aggregate linked days while preserving day, author, evidence, and privacy context.

## OperationalDay ownership and cardinality

The owning trip contains its OperationalDays. A single-day trip starts with one; a multi-day trip starts with one per local calendar date in its date range, including rest days. When a group splits, copy the day into a separate OperationalDay for the new group. Each OperationalDay has exactly one owning trip and owns that day's daily process, observations, activities, and decisions. Distinct group days may share the same owning trip and local date; stable record identifiers, not trip/date pairs, identify them. Copies retain source-day lineage.

Linked day trips remain itinerary/participation views of the multi-day trip's corresponding OperationalDays, not a second owner or duplicate daily record. Implement that mapping explicitly before persisting linked day trips. The authoritative lifecycle is `Trip → OperationalDay → daily process and field records`.

When a group splits, the first group continues the original OperationalDay. The second group receives a complete point-in-time copy of everything recorded at the split, including process state, observations, decisions, evidence, field reports, and event history. Existing visibility rules and original authorship/timestamps are preserved. Each group then records independent events and field reports, with explicit participant and leader changes recorded as events. An OperationalDay does not group multiple independent trips. Changing trip dates or converting a standalone day trip into a linked itinerary day requires explicit reconciliation of ownership and references, preserving its original field evidence.

## Split snapshots and recorded events

A split snapshot has a new day identifier, source-day identifier/version, split time, and actor. Independently editable child records have new identifiers plus original record lineage; inherited evidence/events retain provenance. The full snapshot must remain usable offline and cannot depend on mutable source records. Original permissions remain in force for private information.

Record the split and subsequent plan, participation, role, observation, decision, daily-process, and report changes as attributable events. Keep event time distinct from recording time and preserve corrections/history. The original group continues uninterrupted; the copied group develops its own field report. Trip-wide aggregation identifies common pre-split evidence so copied observations are not counted as separate measurements. See the [daily-process split requirements](../product/use-cases/daily-process.md#copy-a-day-when-the-group-splits).

## Roles and operating modes

Support multiple participants and explicit trip-leader assignments on day trips and multi-day trips. A parent assignment can be offered as a default for a day, but the effective day leader and participants must be visible and explicitly recorded. Daily substitutions must not change prior role history.

Self-guided is the default. The leader facilitates preparation, briefing, communication, and the agreed group decision process. All participants can contribute observations, assessments, and concerns without leader approval. Assigning the leader role does not transfer all safety responsibility, certify competence, or grant guide authority.

Guided is an optional operating-mode configuration on the same canonical entities. Guide responsibilities must be explicitly assigned; an ordinary leader is not automatically a guide. Operating mode and experience profile are related but separate: a professional UI profile does not itself grant authority or membership.

## Relationship to Expedition and OperationalDay

The leadership requirements use Expedition as the lifecycle aggregate. Map a standalone day trip or multi-day trip to that aggregate without creating duplicate trip records. Each trip initially owns one OperationalDay per trip date in both self-guided and guided modes, with additional same-date copies when groups split; linked day-trip views identify the specific group day. Phase 4 adds professional teams, vocabulary, assessments, and reporting; the daily lifecycle is not reserved for professional groups.

Resolve exact type names, cardinalities, and migration contracts in a domain architecture decision before implementation. The current generic `trip` and `daily` documents do not yet implement these relationships.

## Access, privacy, and synchronization

Assessments are public within the authorized trip/group, including individual hazard assessments, evidence, uncertainty, and mindset proposals. Only personal human-factor sections are private. Keep those sections separate from public assessment payloads so reports, copies, synchronization, and event streams cannot accidentally expose them. The leader has a personal assessment under the same privacy rules. The AI combined proposal and human-bias indicator are public to everyone in the trip/group; acceptance requires group review and approval of the specific version. Dedicated AI access to private summaries remains purpose-limited.


A participant's own human-factor assessment is private to them, without leader/admin access or automatic aggregation. Group discussion statements are separate records. Full day copying preserves the history without exposing private content to new groups: protected personal storage and group-readable snapshots must have separate access boundaries. Group reports, event streams, backups, and general AI contexts must not leak private values or private summaries. A purpose-limited AI path may read private summaries solely to assess human-bias/group-dynamics risk. Its output audience is the whole trip/group; score format remains unresolved; every participant must approve the combined proposal, with a single-phone group approval event permitted; this access must not grant leaders raw/private-summary access or feed general report generation. See the [human-factor assessment requirements](../product/human-factor-assessment.md).


Community membership is not blanket consent to share readiness checks, concerns, or personal reflections. Records need author-controlled visibility and selected recipients; aggregation, reports, exports, AI context, and synchronization must enforce the same scope. Leader status alone does not override private visibility.

The PWA stays local-only and requires no API. Local records may represent several participants, but actual multi-device participation requires future authenticated synchronization. Private participant storage and encryption/access boundaries need design before sensitive features can be represented as secure on a shared device. The existing all-local-data backup must not be reused unchanged for confidential participant exports.

## Validation and acceptance requirements

- Test initial day creation and same-date group copies, including source lineage, participant/leader assignment, independent edits, and privacy-preserving copy behavior. Reject duplicate identifiers and invalid cross-trip day/observation references.
- Test multiple community/group memberships and explicit trip participant/leader assignments.
- Reject cross-community day-trip links, invalid dates/order, and duplicate links. Enforce the initial single-parent execution rule.
- Reopening any day trip, standalone or linked, exposes its own daily process, observations, and role context offline.
- Parent summaries retain day-specific provenance and apply recipient-level visibility.
- Removing a parent link never silently deletes the day trip or its observations. Deletion and reassignment require an explicit reference-handling policy.
- Export/import and future migrations preserve community/group membership, day links, role history, daily process links, and observations.
- Native/web/API implementations share domain validation. Neither role assignment nor majority voting overrides an individual’s choice to decline participation.

## Interaction and state updates

[Voice-first commands and event-driven state](events-and-voice.md) define the primary interaction and authoritative mutation path. Accepted events drive projected data; forms provide optional targeted corrections through that same path. Group approval is unanimous and can be recorded from one phone, preserving the full roster, proposal version, and recorder attribution.
