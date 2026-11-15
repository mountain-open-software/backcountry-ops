# Strategic operating mindsets

Status: Product requirements; not implemented

The daily briefing's **strategic mindset** is an operating posture, not a participant's mood, readiness, psychological diagnosis, avalanche danger rating, or guarantee of safety. Personal readiness and human-factor reflections remain separate records with their own sharing permissions.

## Core vocabulary

The following vocabulary is based on the user-supplied description of Roger Atkins' 2014 framework. The original publication, exact terminology, and reuse permissions still need source verification before publishing authoritative educational material. These summaries are product vocabulary, not a field instruction manual.

| Stable key | Display name | Planning meaning |
| --- | --- | --- |
| `assessment` | Assessment / Initial Assessment | High uncertainty; prioritize information gathering and conservative terrain choices. |
| `stepping_out` | Stepping Out | Consider incremental expansion supported by positive evidence; record limits and uncertainty. |
| `status_quo` | Status Quo | Retain established operating boundaries while monitoring changes and complacency. |
| `stepping_back` | Stepping Back | Reduce exposure or terrain options as hazard or uncertainty increases. |
| `entrenchment` | Entrenchment | Maintain constrained terrain choices in response to persistent, high-consequence instability. |
| `open_season` | Open Season / Free Ride | Consider a broader terrain inventory when the assessment supports it; the label does not mean all terrain is safe. |
| `spring_diurnal` | Spring Diurnal | Make timing, aspect, elevation, and changing freeze-thaw conditions explicit in the plan. |

## Extended vocabulary

Keep extensions distinct from the seven core entries. The user identifies these as later Avalanche.org/operational adaptations; exact source lineage remains to be verified.

| Stable key | Display name | Planning meaning |
| --- | --- | --- |
| `maintenance` | Maintenance | A professional terrain-management posture; does not grant authority or competence to perform control work. |
| `high_alert` | High Alert | A highly constrained posture in response to unusual or severe conditions and uncertainty. |

Maintenance is available only through an explicitly configured professional experience profile. Core mindset vocabulary may be used in self-guided mode with appropriate context; selecting any label never changes a participant's authority or certification.

## Daily workflow and data

- Record vocabulary identifier/version, selected mindset, applicable OperationalDay/plan version, author, time, rationale, evidence references, uncertainty, terrain implications, and conditions that would trigger reassessment.
- Individual strategic mindset proposals and hazard assessments are public to the authorized trip/group; personal human-factor sections remain private.
- Participants may propose an individual mindset alongside their hazard assessment. The group records its selected operating mindset and retains differing proposals and rationale.
- A mindset is not inferred automatically from a hazard rating or produced by averaging individual responses.
- Ordered plans and change triggers must be reviewable alongside the mindset. The user records how the posture affects the plan; selecting a label alone is not a completed briefing.
- Record a mindset change as an event, preserving the prior value and the evidence/decision that prompted the change. Changes preserve the mindset and its historical rationale in the shared day timeline.
- Missing selection is `not recorded`, not an implicit Status Quo or declaration that conditions are acceptable.

## Definition of done

- All seven core entries and the two separately identified extensions have stable keys, aliases, vocabulary versions, and source metadata.
- The UI distinguishes strategic mindset, individual readiness, and the [structured avalanche assessment](avalanche-hazard-assessment.md).
- Selection, rationale, evidence, implications, and change triggers persist offline and survive export/import and day copying.
- Individual proposals remain distinct from the group selection; changes preserve authorship, timestamps, prior versions, and disagreements.
- Tests cover unsupported vocabulary values, profile configuration, offline persistence, independent proposals, change history, and day ownership. No selection generates an automatic safety claim or terrain authorization.
