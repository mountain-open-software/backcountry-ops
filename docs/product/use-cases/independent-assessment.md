# UC-HF-02 — Independent assessment before group discussion

Status: Planned; not implemented

## Goal

Reduce premature consensus and groupthink.

## Context

Applies to a community/group day trip, including a day trip linked to a multi-day trip. Self-guided is the default operating mode; guided mode uses the same entities with explicitly configured responsibilities. See [leadership and human-factor requirements](../expedition-leadership-human-factors.md).

## Workflow

1. The group receives the same conditions briefing.
2. Each participant independently records an individual hazard assessment for each proposed plan, with evidence, uncertainty, and concerns.
3. The application combines public hazard assessments, retaining each original contribution and identifying missing responses. Personal human-factor sections remain excluded.
4. Areas of agreement and disagreement are presented.
5. The group discusses the differences.
6. The group records its combined assessment, objective, mindset, selected plan, rationale, unresolved concerns, and conditions that trigger a plan change.

## Visibility

Individual hazard assessments and the combined assessment are public to the authorized trip/group audience. Independent entry means recording one's own assessment before reviewing others; it does not make hazard assessments private. Only personal human-factor sections are private. The leader records their own personal assessment under the same rules. AI prepares a combined proposal and human-bias indicator visible to everyone; the group reviews and approves the version before acceptance.

## Human-factor privacy

An individual's [human-factor assessment](../human-factor-assessment.md) is private to that person and is excluded from automatic consolidation. Public group discussion is separate from private reflection. AI creates the combined proposal for everyone to review; the group, rather than the leader alone, approves it. AI may read private summaries only through the dedicated human-bias risk assessment path, not through ordinary consolidation or report generation. The structured avalanche assessment below remains distinct; shared hazard contributions must still follow their access rules.

## Assessment structure

Avalanche assessments follow the [four CMAH questions](../avalanche-hazard-assessment.md) for each problem: type, terrain location, likelihood, and destructive size. Participants can propose a [strategic mindset](../strategic-mindsets.md) separately. The group compares contributions and records its combined assessment and selected mindset without overwriting the individual originals. Other mountain hazards are not forced into avalanche-specific scales.

## Requirements

- Important differences in interpretation can be discussed before committing to a route or objective.
- Consolidation includes public hazard assessments and excludes private personal human-factor sections.

See the [morning briefing specification](daily-process.md#morning-briefing-objectives-mindset-plans-and-assessments) for the shared briefing fields and completion criteria.

## Proposal approval

Follow the [proposal review and group approval lifecycle](../human-factor-assessment.md#ai-proposal-group-review-and-approval). Everyone, including the leader, contributes an individual assessment and can review the combined proposal and human-bias indicator. Preserve AI drafts and human revisions, record responses against an exact version, and require renewed unanimous group approval for changes against the agreement. The leader can approve execution within the already agreed plan and conditions. All participants must approve the initial proposal and departures from that agreement. A single recorder can enter the group's explicit unanimous approval from one phone as an event tied to the complete roster and proposal version. Missing responses are never implied approval.

## Definition of done

- Each assessment references the same briefing/plan version and preserves its author, time, evidence, and uncertainty.
- A participant can save an independent assessment offline without first viewing other responses.
- Public hazard-assessment consolidation preserves disagreement and does not imply consensus from missing responses.
- The combined assessment references the specific versions of contributions and alternatives without overwriting independent originals, averaging them into a group safety score, or treating a missing response as agreement.
- Each ordered plan has explicit hazards. Plan-change conditions and intended responses are retained alongside the selected plan.
- Strategic mindset is an explicit operating-posture selection with rationale, not an inferred psychological state. Personal readiness and human-factor reflections remain separate and follow participant-controlled visibility.
- Automated checks verify domain validation, organization/community scope, offline save/reopen, and the use case’s access and sharing rules. Multi-device delivery is verified only once an authenticated transport exists.

## Current implementation gap

The current PWA has basic local profiles, memberships, and field records. This workflow, its dedicated domain entities, participant privacy enforcement, and collaborative delivery are not implemented. Local profile switching alone cannot protect sensitive information from other people sharing the same browser storage.
