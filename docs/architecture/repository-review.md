# Monorepo structure review

Scope: Initial local-only PWA and current workspace structure.

## Findings and changes

| Finding | Improvement |
| --- | --- |
| Tests imported sibling package source directly | Use public workspace exports; reject cross-workspace relative imports |
| Root test script selected only application tests | Each behavior-owning package has a test script; root runs workspace tests |
| Domain and renderer checks lived in application tests | Move checks to domain and UI schema packages |
| No dependency boundary enforcement | Check declarations, cycles, application-internal imports, and core/browser-adapter separation |
| No CI or documented contribution path | Add CI, contribution instructions, package READMEs, Node baseline, and Apache license metadata |
| Browser tests assumed a prior build and could reuse stale preview assets | E2E command builds fresh assets and owns a strict-port preview server |
| Layout documentation described even implemented structure as only a proposal | Document current responsibilities and record ADR 0001 |

The existing `projects/` / `packages/` split is appropriate. Renaming folders or adding a build framework would not resolve the actual boundary and verification gaps. Keep the npm workspace structure and add components when there is an implementation to own.

## Remaining architecture work

1. Extract the PWA's growing orchestration component into feature modules and platform-independent commands. Implement the agreed event validation/projection path before adding complex daily-process state.
2. Define canonical shared types and domain relationships for communities, trips, OperationalDays, participant roles, assessments, and approval events. Current generic documents are not that model.
3. Design reproducible migrations, event versioning, recovery, and protected private human-factor storage. Schema version fields and PouchDB revisions alone do not provide these features.
4. Implement API and React Native foundations independently when their work begins. Their current README placeholders do not satisfy the Phase 0 runnable-app criteria.
5. Define adapter contracts for native SQLite, browser persistence, external route/track files/links, and eventual synchronization. Do not add in-app GPS track recording or a mandatory API to the PWA.
6. Expand behavior tests as those capabilities are implemented. The current browser scenario covers basic local persistence, organization switching, and offline recording; it does not prove the planned expedition workflow or participant privacy.

See [ADR 0001](decisions/0001-workspace-boundaries-and-verification.md), [the contribution guide](../../CONTRIBUTING.md), and [the agreed daily-process plan](../product/daily-process-plan.txt).
