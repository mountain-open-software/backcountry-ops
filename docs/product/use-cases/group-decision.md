# UC-HF-06 — Group decision and disagreement record

Status: Planned; not implemented

## Goal

Preserve significant decisions without forcing artificial consensus.

## Context

Applies to a community/group day trip, including a day trip linked to a multi-day trip. Self-guided is the default operating mode; guided mode uses the same entities with explicitly configured responsibilities. See [leadership and human-factor requirements](../expedition-leadership-human-factors.md).

## Workflow

1. A decision is proposed.
2. Alternatives are recorded.
3. Participants can contribute concerns or reasoning.
4. The group applies its agreed decision process.
5. The resulting decision is recorded.
6. Unresolved disagreement can be retained.
7. The plan is updated.

## Requirements

- Support collaborative decisions.
- Support delegated decisions where agreed.
- Record dissent without requiring unanimous agreement.
- Do not treat voting as a substitute for risk assessment.

## Definition of done

- A decision records day trip, plan version, policy, alternatives, contributions, decision-makers, outcome, rationale, and timestamps.
- Delegation is explicit and scoped; assigning a trip leader does not automatically create professional authority.
- Dissent and unresolved concerns remain linked after the decision or plan is updated.
- A vote cannot override a participant’s decision not to participate; missing responses are not votes in favor.
- Edits preserve a reviewable history and do not rewrite earlier contributions without attribution.
- Automated checks verify domain validation, organization/community scope, offline save/reopen, and the use case’s access and sharing rules. Multi-device delivery is verified only once an authenticated transport exists.

## Current implementation gap

The current PWA has basic local profiles, memberships, and field records. This workflow, its dedicated domain entities, participant privacy enforcement, and collaborative delivery are not implemented. Local profile switching alone cannot protect sensitive information from other people sharing the same browser storage.
