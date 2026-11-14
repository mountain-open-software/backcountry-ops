# UC-HF-03 — Participant raises a safety concern

Status: Planned; not implemented

## Goal

Allow any participant to communicate a concern without requiring leader approval.

## Context

Applies to a community/group day trip, including a day trip linked to a multi-day trip. Self-guided is the default operating mode; guided mode uses the same entities with explicitly configured responsibilities. See [leadership and human-factor requirements](../expedition-leadership-human-factors.md).

## Workflow

1. A participant selects Raise concern.
2. The participant describes the issue.
3. The application records the concern locally.
4. The participant selects the intended recipients.
5. The concern is communicated when connectivity permits.
6. The group discusses the issue.
7. Any resulting decision is documented.

## Requirements

- Available offline.
- No leader approval required to create a concern.
- Clear distinction between recorded and delivered concerns.
- No automatic dismissal by majority vote.
- Does not replace immediate verbal communication in the field.

## Definition of done

- Any participant can create and reopen a concern offline without a leader approval or a remote service.
- The concern records author, day-trip context, time, selected recipients, and any decision linkage.
- Recorded, pending delivery, failed, and delivered states are distinct; delivery is not reported before confirmation, and delivery is distinct from acknowledgement.
- Retries preserve the concern identifier without duplicate delivery where the transport supports it.
- Neither a leader action nor an app vote silently deletes a concern or changes an individual’s decision to decline.
- The flow clearly reminds users to communicate urgent concerns directly in the field.
- Automated checks verify domain validation, organization/community scope, offline save/reopen, and the use case’s access and sharing rules. Multi-device delivery is verified only once an authenticated transport exists.

## Current implementation gap

The current PWA has basic local profiles, memberships, and field records. This workflow, its dedicated domain entities, participant privacy enforcement, and collaborative delivery are not implemented. Local profile switching alone cannot protect sensitive information from other people sharing the same browser storage.
