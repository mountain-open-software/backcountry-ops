# UC-HF-02 — Independent assessment before group discussion

Status: Planned; not implemented

## Goal

Reduce premature consensus and groupthink.

## Context

Applies to a community/group day trip, including a day trip linked to a multi-day trip. Self-guided is the default operating mode; guided mode uses the same entities with explicitly configured responsibilities. See [leadership and human-factor requirements](../expedition-leadership-human-factors.md).

## Workflow

1. The group receives the same conditions briefing.
2. Participants independently record observations or concerns.
3. The application consolidates responses.
4. Areas of agreement and disagreement are presented.
5. The group discusses the differences.
6. A final assessment and plan are recorded.

## Requirements

- Important differences in interpretation can be discussed before committing to a route or objective.
- Consolidation respects participant sharing choices.

## Definition of done

- Each assessment references the same briefing/plan version and preserves its author, time, evidence, and uncertainty.
- A participant can save an independent assessment offline without first viewing other responses.
- Authorized consolidation preserves disagreement and does not imply consensus from missing responses.
- The final assessment references contributions and alternatives without overwriting independent originals.
- Automated checks verify domain validation, organization/community scope, offline save/reopen, and the use case’s access and sharing rules. Multi-device delivery is verified only once an authenticated transport exists.

## Current implementation gap

The current PWA has basic local profiles, memberships, and field records. This workflow, its dedicated domain entities, participant privacy enforcement, and collaborative delivery are not implemented. Local profile switching alone cannot protect sensitive information from other people sharing the same browser storage.
