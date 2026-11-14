# Initial use cases

The product use cases, in priority order, are:

1. [Day-trip planning](use-cases/day-trip-planning.md): Prepare and execute a trip planned to start and finish on the same local calendar day without an overnight stay.
2. [Multi-day trip planning](use-cases/multi-day-trip-planning.md): Prepare and execute a trip spanning multiple dates, with daily itinerary stages and overnight planning.
3. [Daily process](use-cases/daily-process.md): Review information, prepare the day, track changes, and retain a traceable daily review.
4. [Observation reporting](use-cases/observation-reporting.md): Capture, review, preserve, and report field observations and their original evidence.

Communities contain groups, day trips, and multi-day trips. A multi-day trip groups and links its day trips; each day trip owns its daily process and observations. Users may belong to multiple communities/groups and hold trip-scoped leader roles. Both trip variants remain usable offline without an API. See the [community and trip model](../architecture/community-trip-model.md).

Each use case defines its goal, workflow, scope, definition of done, and current implementation gaps. Completion requires meeting its applicable criteria, not merely having a form or package placeholder.

The [product vision](vision.md) defines the overall direction. The [phased roadmap](roadmap.md) groups technical and product capabilities into delivery phases. Use-case priority expresses the product focus; supporting capabilities and acceptance gates are scheduled by the roadmap.

## Leadership and human-factor use cases

Self-guided is the default operating mode. See [Expedition leadership, shared responsibility and human factors](expedition-leadership-human-factors.md) for the common requirements and guided-mode differences.

- [UC-HF-01 — Group readiness and comfort check](use-cases/group-readiness.md)
- [UC-HF-02 — Independent assessment before group discussion](use-cases/independent-assessment.md)
- [UC-HF-03 — Participant raises a safety concern](use-cases/safety-concern.md)
- [UC-HF-04 — Decision checkpoint](use-cases/decision-checkpoint.md)
- [UC-HF-05 — Fatigue and time-pressure reassessment](use-cases/fatigue-time-pressure.md)
- [UC-HF-06 — Group decision and disagreement record](use-cases/group-decision.md)
- [UC-HF-07 — Human-factor debrief](use-cases/human-factor-debrief.md)

These are cross-cutting use cases within day trips and their daily process; their identifiers do not change the four primary use-case priorities.
