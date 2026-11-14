# ADR 0001 — Workspace boundaries and verification

Status: Accepted

## Context

The repository has a runnable React/Vite PWA and four small shared packages. Mobile and API are reserved workspaces. Tests previously reached across sibling source directories, and root testing selected only application tests. There was no automated enforcement of package boundaries or CI verification.

## Decision

Keep npm workspaces and the existing `projects/` and `packages/` layout. Give each package ownership of its unit tests and import other workspaces only through declared package exports. Root scripts orchestrate workspace tests, structural checks, and PWA production builds. CI also runs the offline browser scenario against a freshly built static site.

Use `.nvmrc` for the development/CI Node baseline and the committed lockfile with `npm ci` for reproducible installs. Shared packages remain private until release/versioning policy is established. A lightweight structure check rejects undeclared literal imports, cross-workspace relative imports, dependencies on application internals, browser persistence imports into core packages, higher-level workspace dependencies in domain, and workspace dependency cycles.

The PWA remains independent of API and native tooling. Placeholder workspaces do not claim runnable status. Domain, application, UI definitions, and browser storage remain separate responsibilities.

## Alternatives considered

- Flattening everything into the PWA would simplify immediate development but prevent meaningful reuse and native boundaries.
- Adding a monorepo build framework is unnecessary for the current number of small packages. Revisit if dependency-aware caching or multi-language orchestration is needed.
- Moving all workspaces now would create path churn without improving actual boundaries.

## Consequences and follow-up

New tests are discovered through the owning workspace's test script. New package imports must be declared even if npm hoists them. Browser tests own their server and avoid accidentally testing a stale manually running preview. The lightweight import scanner is not a full language parser.

The canonical types, voice/event command path, migrations, protected private assessments, native app, and API remain future work. This structural improvement does not complete Phase 0 or implement the planned daily process.
