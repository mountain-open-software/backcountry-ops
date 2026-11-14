# UC-HF-05 — Fatigue and time-pressure reassessment

Status: Planned; not implemented

## Goal

Recognize changes in group capability during the day.

## Context

Applies to a community/group day trip, including a day trip linked to a multi-day trip. Self-guided is the default operating mode; guided mode uses the same entities with explicitly configured responsibilities. See [leadership and human-factor requirements](../expedition-leadership-human-factors.md).

## Workflow

1. The group reaches a planned checkpoint or notices a relevant change.
2. Participants reassess energy, readiness and available time.
3. The group reviews the remaining route and alternatives.
4. The group decides whether to continue, modify or stop the activity.
5. The decision is recorded if appropriate.

## Requirements

- The application should avoid inferring a person’s fitness, mental state or competence from GPS speed alone.

## Definition of done

- Participants can record self-reported capability and timing concerns offline with explicit sharing choices.
- The review references remaining route, turnaround criteria, available alternatives, and the relevant day trip.
- Continue, modify, and stop outcomes can be recorded with rationale and unresolved concerns.
- GPS pace is not used to assign fitness, psychological state, competence, or a safety score.
- Automated checks verify domain validation, organization/community scope, offline save/reopen, and the use case’s access and sharing rules. Multi-device delivery is verified only once an authenticated transport exists.

## Current implementation gap

The current PWA has basic local profiles, memberships, and field records. This workflow, its dedicated domain entities, participant privacy enforcement, and collaborative delivery are not implemented. Local profile switching alone cannot protect sensitive information from other people sharing the same browser storage.
