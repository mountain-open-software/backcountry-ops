# UC-HF-07 — Human-factor debrief

Status: Planned; not implemented

## Goal

Improve group learning and future decision-making.

## Context

Applies to a community/group day trip, including a day trip linked to a multi-day trip. Self-guided is the default operating mode; guided mode uses the same entities with explicitly configured responsibilities. See [leadership and human-factor requirements](../expedition-leadership-human-factors.md).

## Workflow

1. Participants review the day’s decisions.
2. Reflect on communication and group dynamics.
3. Identify moments of pressure, uncertainty or disagreement.
4. Document useful lessons.
5. Select what may be shared with the group.
6. Carry relevant lessons into future planning.

## Requirements

- The system should avoid labeling individual participants as unsafe or assigning psychological scores.
- The goal is learning, not assigning blame.

## Definition of done

- Each day trip supports a debrief referencing plans, observations, decisions, and communication lessons.
- Individual reflections remain private unless their author explicitly selects recipients or material to share.
- Group reports and AI summaries omit private reflections without authorization; publication requires the designated editor’s action.
- Lessons can be linked into the next day trip of a multi-day trip without widening their sharing scope.
- Debrief prompts do not diagnose participants, label them unsafe, or generate psychological scores.
- Automated checks verify domain validation, organization/community scope, offline save/reopen, and the use case’s access and sharing rules. Multi-device delivery is verified only once an authenticated transport exists.

## Current implementation gap

The current PWA has basic local profiles, memberships, and field records. This workflow, its dedicated domain entities, participant privacy enforcement, and collaborative delivery are not implemented. Local profile switching alone cannot protect sensitive information from other people sharing the same browser storage.
