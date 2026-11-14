# Monorepo structure proposal

Status: Proposed

The repository should support the [product vision](../product/vision.md): a shared foundation serving multiple independent products, with documented extension points and self-hosted deployments.

## Intended layout

```text
docs/
  product/                 # Vision, scope, priorities, and product requirements
  architecture/            # System design, boundaries, contracts, and diagrams
    decisions/             # Architecture decision records
projects/                  # Independently runnable applications and services
  <project-name>/
packages/                  # Reusable domain capabilities, contracts, and SDKs
extensions/                # Optional modules, integrations, and provider adapters
deploy/                    # Self-hosting, deployment, and upgrade tooling
tools/                     # Shared development and repository automation
```

The initial scaffold includes a working PWA and shared packages, plus API and mobile placeholders. Add further implementation directories when they have real content. The [application architecture](application.md) establishes a React PWA built with Vite and deployed as a static site, with local PouchDB storage, JSON-driven rendering, and future React Native and CouchDB support. Other component tooling and deployment details remain open decisions.

## Boundaries

- Each project owns its entry points, configuration, tests, and setup instructions. Projects share capabilities through documented package interfaces rather than importing another project's internals.
- Shared packages hold reusable capabilities. Keep the canonical domain model and versioned contracts independent of application-specific persistence schemas and external providers.
- Extensions hold organization-specific behavior and replaceable integrations. The shared foundation must work without a particular external platform or AI provider.
- Deployment tooling should support reproducible self-hosting. Multiple projects may be deployed independently or together; a monorepo does not require a single deployment.
- Cross-project architecture and product documentation lives in `docs/`. Component-specific documentation lives with the component.

## Incremental setup

1. Validate domain boundaries and record the first architecture decisions.
2. Introduce the first application and only the shared packages it needs.
3. Select repository workspace tooling around the initial React/Vite application and shared packages.
4. Add checks for affected components, with broader checks when shared contracts change.
5. Define API compatibility, package versioning, release, and migration policies before downstream consumers depend on them.
6. Add example extensions and self-hosted deployment instructions alongside working implementations.

Do not assume that all projects share a language, release schedule, or runtime. Choose tooling that fits the actual components and keeps downstream forks maintainable.
