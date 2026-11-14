# Browser persistence

Browser-only PouchDB adapter. API and React Native code must use their own adapters; do not import this browser module into platform-independent core packages. Current writes are direct document mutations, not the planned event/projection system.

Import the public API as `@open-mountain/storage-pouchdb` and declare it in the consuming workspace manifest. Do not import `src/` across workspace boundaries.

Verify from the repository root with `npm run test:e2e`.
