# UC-HF-04 — Decision checkpoint

Status: Planned; not implemented

## Goal

Encourage deliberate reassessment before consequential terrain or activity decisions.

## Context

Applies to a community/group day trip, including a day trip linked to a multi-day trip. Self-guided is the default operating mode; guided mode uses the same entities with explicitly configured responsibilities. See [leadership and human-factor requirements](../expedition-leadership-human-factors.md).

## Workflow

1. The group identifies a decision point.
2. Reviews current conditions.
3. Compares observations with the original plan.
4. Reviews alternatives.
5. Invites concerns.
6. Makes a decision using the agreed group process.
7. Records the decision and rationale.

## Requirements

- Triggers may include entering avalanche terrain, beginning a technical climbing section, crossing a glacier, committing to an exposed route, passing a planned turnaround point, significant weather deterioration, or major route deviation.
- The application should support the checkpoint without requiring users to interact with their phones in unsafe terrain.

## Definition of done

- A checkpoint can be created locally for a day trip and linked to its plan, conditions, alternatives, concerns, and resulting decision.
- A participant may record the checkpoint after reaching a suitable place; an on-screen action is not required to proceed or stop in the field.
- The record distinguishes event time from entry time and retains rationale and the decision policy used.
- Checkpoint presentation never labels a route safe or treats a completed checklist as authorization to continue.
- Automated checks verify domain validation, organization/community scope, offline save/reopen, and the use case’s access and sharing rules. Multi-device delivery is verified only once an authenticated transport exists.

## Current implementation gap

The current PWA has basic local profiles, memberships, and field records. This workflow, its dedicated domain entities, participant privacy enforcement, and collaborative delivery are not implemented. Local profile switching alone cannot protect sensitive information from other people sharing the same browser storage.
