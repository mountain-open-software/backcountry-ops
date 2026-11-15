# ADR 0003 — Expo native application with SQLite

Status: Accepted for the solo native implementation

## Context

The user requested a native Expo app in addition to the mobile/desktop PWA. Domain behavior must remain consistent without importing browser PouchDB, DOM components, or browser globals into native code. The future server/collaboration phase remains deferred.

## Decision

Use Expo SDK 58, React Native, and TypeScript in `projects/mobile`, with ordinary native feature components for the existing solo workflow. Expo Metro resolves the npm workspace packages. Keep device recording, playback, point location, file picker, sharing, and app identity bootstrap inside the native application.

Add `packages/storage-sqlite` as a native implementation of the shared journal interface. A driver-injected SQL core permits real SQLite contract tests without an emulator. One database per user/community contains a revisioned journal row and an attachment index. Initialize schema version 1 in a transaction and reject unsupported newer schemas. SQL compare-and-swap rejects stale writes without overwriting accepted events.

Use app document files for attachments, with immutable generated IDs and owner-scoped directories. Resolve attachment paths against the current app document root so a changed sandbox path does not invalidate all evidence. Sharing uses a cache copy with a usable filename/extension. File copy precedes the referencing event; rejected commands can leave orphan files for future explicit cleanup.

Inject UUID/clock providers into the shared command service; Expo supplies native UUID generation. Domain states/events are JSON data, cloned without depending on the browser's `structuredClone`. These changes preserve browser behavior and are covered by the shared tests and PWA browser regression suite.

## Verification and limits

Native type checking, transactional migration/reopening, SQL revision conflicts, user/community isolation, shared closing lifecycle, and GPX parsing are tested locally. Metro exports Hermes bundles for both Android and iOS. There is no simulator, emulator, native SDK build/signing environment, or device in this workspace; actual device UI/permissions/audio/lifecycle testing remains required. Expo Doctor's two remote metadata checks could not reach their services; local Expo config resolved.

The native app shares the version 2 backup event/file envelope and preserves immutable source events; explicit backup transfer is not synchronization. Multi-writer CouchDB behavior, accounts/passwords, server AI, signed APK/IPA delivery, JSON-customized views, offline maps, and merging remain separate work. The local native app does not complete all broader roadmap phase gates or implement the API placeholder.
