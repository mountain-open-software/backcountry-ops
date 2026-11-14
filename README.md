# Open Mountain

An open-source, self-hosted, extensible technology foundation for the backcountry community.

One shared foundation. Multiple independent products. An interoperable backcountry ecosystem.

This monorepo contains a working local-only PWA, shared packages, documentation, and placeholders for a future API and React Native application.

- [Product vision v2.0](docs/product/vision.md)
- [Initial use cases](docs/product/use-cases.md)
- [Leadership and human-factor requirements](docs/product/expedition-leadership-human-factors.md)
- [Community and trip model](docs/architecture/community-trip-model.md)
- [Phased roadmap](docs/product/roadmap.md)
- [Documentation index](docs/README.md)
- [Monorepo structure proposal](docs/architecture/monorepo.md)
- [Application architecture](docs/architecture/application.md)
- [Architecture decisions](docs/architecture/decisions/README.md)

Licensed under the [Apache License 2.0](LICENSE).

## Run locally

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

The PWA works entirely in the browser with local PouchDB storage. No API or backend setup is required.

```sh
npm test
npm run build
npm run preview
```

See the [PWA guide](projects/pwa/README.md) for offline testing and backups.

## Workspace

- `projects/pwa`: working React/Vite PWA.
- `projects/mobile`: future React Native application structure.
- `projects/api`: future API structure; no server required today.
- `packages/domain`: records and domain identifiers.
- `packages/application`: organization membership and record scoping.
- `packages/ui-schema`: versioned JSON-compatible screen definitions.
- `packages/storage-pouchdb`: browser-local persistence.
