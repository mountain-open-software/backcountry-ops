# Native SQLite adapter

Expo SQLite implements the shared `JournalAdapter` contract. One SQLite database per user/community stores an append-only domain-event journal and attachment metadata. Native file bytes are managed by the mobile app's platform adapter.

The driver-injected core applies a transactional schema-version migration, rejects newer unsupported versions, and uses SQL compare-and-swap to reject stale appends. Domain commands are validated by `@open-mountain/application` before storage; this adapter does not invent authorization or synchronization rules.

```sh
npm test -w @open-mountain/storage-sqlite
```

Tests use Node's real SQLite engine to verify reopening/migrations, stale writes, owner isolation, and event replay through the shared application service. They do not test native permission dialogs or the Expo bridge on hardware.

Core packages must not import this platform adapter. Native apps import the public `@open-mountain/storage-sqlite` API; browser apps use their own storage adapter.
