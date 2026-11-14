# Structured avalanche hazard assessment — CMAH

Status: Product requirements; not implemented

Use the four CMAH questions supplied by the user as the structure for individual and combined group avalanche assessments. Verify the primary CMAH reference and the applicable likelihood/size terminology before implementing a standards-compatible vocabulary. This document records the requested product structure rather than claiming validated conformance to a specific publication.

An assessment belongs to an OperationalDay and a specific plan/briefing version. It contains zero or more explicitly identified avalanche problems. An empty or incomplete assessment is not evidence that no problem exists; record `not assessed`, `information unavailable`, and an explicit assessed absence separately.

## 1. What avalanche problems exist?

Support these initial problem types through a versioned vocabulary:

- Storm Slab.
- Wind Slab.
- Persistent Slab.
- Deep Persistent Slab.
- Loose Dry.
- Loose Wet.
- Wet Slab.
- Cornice Fall.
- Glide Avalanche.

Each problem has a stable identifier and its own location, likelihood, size estimates, evidence, uncertainty, and applicable time window. Do not collapse several problems into one rating. Permit an explicitly described unclassified problem without silently assigning a known type.

## 2. Where are the problems located?

Record applicable elevation bands (Alpine, Treeline, Below Treeline), aspects (N, NE, E, SE, S, SW, W, NW), and terrain-feature descriptions such as convexities, thin-snowpack areas, or wind-loaded terrain.

Record geographic scope and numeric elevation bounds/units where available. Elevation-band definitions vary by location; retain the regional/provider context rather than assuming universal altitude thresholds. Distinguish unknown, not assessed, and explicitly all aspects/bands.

## 3. How likely are avalanches to occur?

Capture the assessed likelihood from Unlikely through Almost Certain using a versioned categorical vocabulary. The complete intermediate vocabulary and its definitions must be confirmed against the selected standard before implementation.

Keep natural and human-triggered likelihood separate where assessed, with trigger context and evidence. Do not invent percentages or average categorical values. Missing likelihood remains unknown rather than defaulting to Unlikely.

## 4. How big could the avalanches be?

Capture estimated destructive size using the Canadian size scale, Size 1 through Size 5. Permit an expected range where appropriate, preserving uncertainty and the scale/version used. Validate lower/upper bounds and their order.

Size is distinct from likelihood. Do not label Size 1 harmless or equate a smaller size with a safe outcome; consequences depend on terrain and exposure. Authoritative size-class descriptions, permitted increments, and regional mappings require source verification before implementation.

## Visibility

Individual avalanche assessments and the combined group assessment are public to trip/group participants, including their supporting evidence, uncertainty, and strategic mindset proposals. Only the personal human-factor section is private; it must be stored separately or reliably excluded from public assessment payloads. Independent assessment entry is a workflow sequence, not a permanent confidentiality rule. Public does not imply internet publication or permission for external submission.

## Individual assessment and group combination

1. Present the same plan version and available briefing sources to participants.
2. Each participant independently records problems through the four questions, supporting evidence, uncertainty, and unresolved concerns. They may also propose a [strategic mindset](strategic-mindsets.md).
3. Consolidate public individual hazard assessments; exclude private human-factor content. Retain each original assessment and identify missing responses.
4. Compare problem types, locations, likelihoods, sizes, and differing interpretations side by side. Do not replace disagreement with an average, majority rating, or safety score.
5. The group discusses the differences and records its combined assessment with rationale and source contribution/version references. Record unresolved disagreement explicitly.
6. Link the combined assessment to the selected mindset, Plan A/Plan B hazards, terrain implications, and conditions triggering a plan change. Those are related but distinct records.
7. Field observations can prompt a revision. Preserve prior assessments and record the change and resulting decision as events.

## Definition of done

- A participant can create multiple problem entries, each answering all four questions or explicitly identifying missing information, entirely offline.
- Each entry preserves problem identity, assessment author, applicable location/time, plan version, source evidence, uncertainty, and vocabulary/scale versions.
- Validation covers known vocabulary, aspects/bands, size bounds/order, and separate likelihood/size fields. Incomplete entries remain identifiable drafts and cannot masquerade as complete assessments.
- Original individual avalanche assessments remain visible to trip/group participants after group consolidation and later revisions. No automatic group safety score or route-safe result is calculated.
- The combined assessment identifies its contributors, versions, missing input, rationale, and unresolved differences.
- Field changes preserve original evidence, timestamps, and history. Multiple participants record on the same trip/date day, with each contribution attributable.
- Automated checks cover multiple problems, unknown versus assessed absence, geographic/elevation context, size-range validation, likelihood vocabulary, participant permissions, offline persistence, trip/day uniqueness, and preservation of disagreement.

## Scope boundary

This avalanche-specific assessment complements other mountain hazards such as falls, glacier hazards, weather exposure, and rockfall. The daily process must not force unrelated hazards into avalanche problem types or the Canadian avalanche size scale.
