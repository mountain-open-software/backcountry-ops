# UC-HF-01 — Group readiness and comfort check

Status: Planned; not implemented

## Goal

Establish whether participants are prepared and comfortable with the proposed activity.

## Context

Applies to a community/group day trip, including a day trip linked to a multi-day trip. Self-guided is the default operating mode; guided mode uses the same entities with explicitly configured responsibilities. See [leadership and human-factor requirements](../expedition-leadership-human-factors.md).

## Workflow

1. The trip leader initiates a readiness check.
2. Participants review the proposed objective.
3. Each participant indicates readiness, concerns or need for more information.
4. Participants choose which information to share.
5. The group discusses unresolved concerns.
6. The plan is adjusted where appropriate.
7. The system records the agreed outcome.

## Private reflection and group contribution

The participant's own [human-factor assessment](../human-factor-assessment.md) is private to them. Sharing a practical concern or readiness statement creates a separate contribution; it does not grant access to the private assessment. Group/leader views never automatically expose private responses. The leader writes the public version; a separately authorized AI process may read private summaries solely to assess human-bias risk, as specified in the linked requirements. Existing references to sharing choices below apply to those separate contributions, not to opening the private assessment to other users.

## Requirements

- Participants can respond independently.
- Sensitive responses are not automatically shared.
- The system does not calculate a group safety score.
- Unresolved concerns are visible only to authorized recipients according to the participant’s sharing choices.

## Definition of done

- A participant can record and revise readiness offline against the relevant day-trip plan version; a missing response is never represented as consent.
- Supported responses include comfortable, conservative alternative only, more information needed, and not comfortable proceeding.
- Private responses and authorized sharing choices survive restart and are excluded from unauthorized views, exports, synchronization payloads, and AI context.
- The agreed outcome and any plan adjustment are recorded without erasing original responses or overriding a participant’s choice to decline.
- Automated checks verify domain validation, organization/community scope, offline save/reopen, and the use case’s access and sharing rules. Multi-device delivery is verified only once an authenticated transport exists.

## Current implementation gap

The current PWA has basic local profiles, memberships, and field records. This workflow, its dedicated domain entities, participant privacy enforcement, and collaborative delivery are not implemented. Local profile switching alone cannot protect sensitive information from other people sharing the same browser storage.
