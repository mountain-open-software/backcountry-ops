# Open Mountain — Expo native app

React Native and TypeScript, using Expo SDK 58. Shares domain validation, event replay, and the command service with the PWA; uses native SQLite and app-local files rather than browser PouchDB.

## Run on a device

From the monorepo root:

```sh
npm ci
npm run dev:mobile
```

Open the QR code using Expo Go compatible with SDK 58 on an iPhone/Android phone on the same network. Alternatively use a compatible local development build. Expo's terminal offers simulator/emulator controls; those require an installed iOS simulator or Android emulator. The managed cloud workspace's LAN address is not automatically reachable from an external phone: run Metro on your own machine/network for device testing.

```sh
npm run ios -w @open-mountain/mobile
npm run android -w @open-mountain/mobile
```

The first download of the Expo bundle needs connectivity. App data capture works locally afterward; production/dev-client packaging is separate from Expo Go's development-server lifecycle. No application API, CouchDB server, login, or environment file is required.

## Implemented native workflow

- Local username, stable identity, and community workspaces.
- Day trips/multi-day trips and one OperationalDay per trip/date.
- Briefing, avalanche problems, plan approval, and field decisions.
- Personal human-factor reflections in a separate user database.
- Voice recording and offline playback, attached recordings, typed observations, and permission-based point location.
- GPX file import and sharing, external route links, public day export.
- Own report submission, debrief, explicit leader closing, post-close corrections, and timeline.
- Full backup/restore with recordings/private notes, using the same version 2 event/file envelope as the PWA. Transfer remains an explicit backup action, not synchronization.
- Confirmed non-conflicting day-trip movement; date conflicts show **Merge — Coming soon**.

Audio capture is foreground-only. Stop and save the preview to retain it; unfinished recordings can be lost on app termination. Typed notes and optional keyboard dictation remain available, but the app has no built-in offline transcription model or server AI. It does not record GPS tracks or provide offline maps.

## Local storage and migrations

`packages/storage-sqlite` creates one `.db` per user/community, applies a transactional `PRAGMA user_version = 1` migration, and appends journals using revision compare-and-swap. Attachment bytes live under owner-scoped directories in app document storage; SQLite stores their metadata. The active identity is a small file, not another application database. Identity updates use write-then-move; journal events remain the authoritative domain history.

The same limits apply as the initial PWA: 90 days per trip, 5,000 events / 15 million JSON characters per journal, 20 MB per attachment, and 100 MB per full backup. Backups include private notes and are not encrypted. Restore accepts matching history/newer continuations and rejects divergent histories rather than merging. Removing the app can remove its local files and databases; export first.

## Verification and build meaning

```sh
npm run typecheck
npm test
npm run build:mobile
```

`build:mobile` runs Metro/Expo export for **both iOS and Android**, producing JavaScript/Hermes bundles in `projects/mobile/dist/`. It is not a signed `.ipa`/`.apk` or an App Store upload. Those require platform build tooling/signing or a separately configured EAS build; no account/project or release signing is configured here.

The SQL contract tests use real SQLite through Node, including migration/reopening, compare-and-swap, owner isolation, and the shared submission/debrief/closing lifecycle. GPX tests validate native parsing. Bundle export and type checking do not replace device testing of microphone, permissions, file picker/sharing, layout, or lifecycle behavior.

This workspace has no Android emulator or iOS simulator. Expo Doctor passed its local checks, but two remote schema/directory checks could not finish because the external metadata services were unreachable. Local Expo config and bundled dependency checks resolved; device QA remains required.
