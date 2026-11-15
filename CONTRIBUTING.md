# Contributing

Use Node.js 22 LTS (at least 22.18.0) (`nvm use` reads `.nvmrc`) and install the locked dependencies from the repository root:

```sh
npm ci
npm run dev
```

The PWA requires no API, database server, external account, or environment file. The Expo mobile app runs with `npm run dev:mobile`; the API remains a placeholder. Both applications share domain/application packages and run without an application server.

## Checks

```sh
npm run check
npx playwright install chromium
npm run test:e2e
```

`check` verifies workspace boundaries, type-checks web/native, runs workspace unit tests (including real SQLite), and builds the PWA. `npm run build:mobile` exports Android/iOS bundles; CI also runs that export. `test:e2e` builds production assets and starts its own static preview on port 4173; stop any manually running preview first. To use an installed Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. CI runs the same checks and the offline browser scenario.

Run one package's checks with `npm test -w @open-mountain/domain` or another test-owning workspace name. Put domain tests with domain code, application tests with application code, and renderer-contract tests with the UI schema. Cross-application browser scenarios belong in `tests/`.

## Package boundaries

Use `@open-mountain/<package>` public exports to import shared code. Declare dependencies in the importing workspace's manifest; do not rely on a dependency being hoisted to the root. Do not import sibling `src/` directories or application internals. Workspaces cannot depend on application internals, and workspace dependencies must be acyclic. Domain cannot depend on higher-level workspaces; domain, application, and UI schema cannot depend on platform storage adapters. The structure check covers literal imports; it is not a complete JS/TS dependency parser, and new import patterns may require extending it.

Keep domain logic platform-independent. Keep device and database code behind adapters. Do not add a backend requirement to the local PWA. API and native dependencies belong in their own workspaces when those projects are implemented.

## Changes and review

Create a branch and submit a pull request describing the problem, behavior change, and checks run. Update relevant product/use-case documentation when behavior changes. Distinguish implemented behavior from planned requirements. Record significant architecture choices in [architecture decision records](docs/architecture/decisions/README.md); supersede old decisions instead of silently rewriting their rationale.

Do not commit secrets, local browser data, recordings, private assessments, generated builds, or dependencies. Use synthetic examples in tests and reports. Contributions use the repository's [Apache License 2.0](LICENSE).
