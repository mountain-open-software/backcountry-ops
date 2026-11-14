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

## Roles and operating modes

Support multiple participants and explicit trip-leader assignments on day trips and multi-day trips. A parent assignment can be offered as a default for a day, but the effective day leader and participants must be visible and explicitly recorded. Daily substitutions must not change prior role history.

Self-guided is the default. The leader facilitates preparation, briefing, communication, and the agreed group decision process. All participants can contribute observations, assessments, and concerns without leader approval. Assigning the leader role does not transfer all safety responsibility, certify competence, or grant guide authority.

Guided is an optional operating-mode configuration on the same canonical entities. Guide responsibilities must be explicitly assigned; an ordinary leader is not automatically a guide. Operating mode and experience profile are related but separate: a professional UI profile does not itself grant authority or membership.

## Relationship to Expedition and OperationalDay

The leadership requirements use Expedition as the lifecycle aggregate. Map a standalone day trip or multi-day trip to that aggregate without creating duplicate trip records. Each day trip supplies a daily process/OperationalDay context in both self-guided and guided modes. Phase 4 adds professional teams, vocabulary, assessments, and reporting; the daily lifecycle is not reserved for professional groups.

Resolve exact type names, cardinalities, and migration contracts in a domain architecture decision before implementation. The current generic `trip` and `daily` documents do not yet implement these relationships.

## Access, privacy, and synchronization

Community membership is not blanket consent to share readiness checks, concerns, or personal reflections. Records need author-controlled visibility and selected recipients; aggregation, reports, exports, AI context, and synchronization must enforce the same scope. Leader status alone does not override private visibility.

The PWA stays local-only and requires no API. Local records may represent several participants, but actual multi-device participation requires future authenticated synchronization. Private participant storage and encryption/access boundaries need design before sensitive features can be represented as secure on a shared device. The existing all-local-data backup must not be reused unchanged for confidential participant exports.

## Validation and acceptance requirements

- Test multiple community/group memberships and explicit trip participant/leader assignments.
- Reject cross-community day-trip links, invalid dates/order, and duplicate links. Enforce the initial single-parent execution rule.
- Reopening any day trip, standalone or linked, exposes its own daily process, observations, and role context offline.
- Parent summaries retain day-specific provenance and apply recipient-level visibility.
- Removing a parent link never silently deletes the day trip or its observations. Deletion and reassignment require an explicit reference-handling policy.
- Export/import and future migrations preserve community/group membership, day links, role history, daily process links, and observations.
- Native/web/API implementations share domain validation. Neither role assignment nor majority voting overrides an individual’s choice to decline participation.
