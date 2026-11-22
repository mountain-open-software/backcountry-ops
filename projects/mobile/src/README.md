# Native application source

`App.tsx` hosts the solo native workflow and responsive phone/tablet layout. Feature components are ordinary React Native views; no JSON renderer is used.

`useWorkspace.ts` connects the shared application service to native SQLite. `nativeStorage.ts` owns bootstrap identity, scoped attachments, backup/restore, and file sharing. Platform APIs stay here; shared domain/application packages do not import Expo or browser storage.

See [the app guide](../README.md) for running, verification, and platform limits.
