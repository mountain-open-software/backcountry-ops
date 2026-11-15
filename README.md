# Open Mountain

An open-source, self-hosted, extensible technology foundation for the backcountry community.

One shared foundation. Multiple independent products. An interoperable backcountry ecosystem.

This monorepo contains a mobile and desktop React/TypeScript PWA for solo trip planning and field recording, shared packages, documentation, and an Expo native app. The API remains a future placeholder.

- [Product vision v2.0](docs/product/vision.md)
- [Implemented solo version and limits](docs/product/solo-version-implementation.md)
- [Initial use cases](docs/product/use-cases.md)
- [Leadership and human-factor requirements](docs/product/expedition-leadership-human-factors.md)
- [Community and trip model](docs/architecture/community-trip-model.md)
- [Phased roadmap](docs/product/roadmap.md)
- [Documentation index](docs/README.md)
- [Monorepo structure](docs/architecture/monorepo.md)
- [Application architecture](docs/architecture/application.md)
- [Architecture decisions](docs/architecture/decisions/README.md)

Licensed under the [Apache License 2.0](LICENSE).

## Run locally

Use Node.js 22 LTS (`nvm use`), at least 22.18.0. The native toolchain also supports Node 24.3+ or 26+.

```sh
npm ci
npm run dev
```

The PWA works entirely in the browser with local PouchDB storage. No API or backend setup is required.

```sh
npm run check
npm run preview
```

See the [PWA guide](projects/pwa/README.md) for offline testing and backups, and [CONTRIBUTING.md](CONTRIBUTING.md) for package boundaries and verification commands.

## Workspace

- `projects/pwa`: responsive React/TypeScript/Vite PWA.
- `projects/mobile`: Expo/React Native/TypeScript solo app for iOS and Android.
- `projects/api`: future API structure; no server required today.
- `packages/domain`: typed contracts, command validation, events, and deterministic state replay.
- `packages/application`: command orchestration and storage contracts.
- `packages/ui-schema`: legacy JSON screen definitions reserved for future customization; not used by the current React UI.
- `packages/storage-pouchdb`: per-user/per-community browser journals, attachments, and backup/restore.
- `packages/storage-sqlite`: native SQLite journals, migrations, and attachment index.

- `tools`: repository structure checks.
- `tests`: browser scenarios spanning the application and shared packages.
- `.github/workflows`: automated verification.

## Native app

```sh
npm run dev:mobile
npm run build:mobile
```

Use Expo Go compatible with SDK 58 or a local development build. `build:mobile` exports iOS/Android bundles; it does not sign an installable APK/IPA. See the [native app guide](projects/mobile/README.md).
