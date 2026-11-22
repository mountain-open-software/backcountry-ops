# Solo version — Implemented behavior and limits

Status: Local implementation on `feat/solo-daily-process`; not deployed

## Available

- React/TypeScript PWA built with Vite, with desktop and touch-sized mobile layouts.
- Username onboarding, stable local identity, multiple local community workspaces, separate personal/community PouchDB databases.
- Day trips and multi-day trips, with exactly one OperationalDay per date and no group splitting.
- Briefing: objective, an ordered list of plans (A, B, C onward) and their hazards, change triggers, strategic mindset, optional structured avalanche problems, and the user's hazard assessment. Versioned explicit solo approval and approval invalidation on briefing edits.
- Private personal reflection in the user database, excluded from public timeline and day export. No PIN, encryption, or remote account is implied.
- Field decisions: record actions within the agreed plan with trigger/rationale, or explicitly approve a departure as the sole participant.
- Offline audio capture with preview, optional browser dictation, attached recordings, manual observations, and optional permission-based point location. Review text before saving.
- Own report submission, explicit nothing-to-add submission, five-topic personal debrief, and explicit leader closing. A server/AI summary is not required.
- Post-close observations/corrections, automatic report amendment, preserved original events, and visible post-close timeline entries without reopening the day.
- Planned/actual GPX uploads, independent original-file download, and external navigation/track links. No in-app tracking or drawing.
- Public JSON day export; explicit full private-inclusive backup/restore with recordings and GPX; previous-version records retained as a downloadable archive.
- Confirmed day-trip movement into a different expedition, extending its dates if needed. Destination-date conflicts leave both trips unchanged and show **Merge — Coming soon**.

## Deliberately unavailable

Server AI, human-bias scores, generated summaries, synchronization, CouchDB accounts/passwords, shared-device group approvals, authenticated multi-user collaboration, signed native binaries, offline map packages, automatic route-provider imports, and JSON view customization. The UI does not simulate server activity or display a missing AI score as low risk.

## Expo native companion

The [native app](../../projects/mobile/README.md) now implements the solo workflow with Expo/React Native/TypeScript, shared events/commands, per-user/per-community SQLite, and native audio/files/pickers/sharing. Android and iOS JavaScript/Hermes bundles export locally; no signed binaries or on-device test results are claimed. Its phone/tablet UI uses ordinary React Native components. The API, collaboration, and server AI remain deferred.

## Recording, data, and backup limits

Recording needs browser microphone support and permission on HTTPS or localhost. Recording stops after 10 minutes or near the 20 MB attachment cap. Stopped and attached audio is persisted locally with its draft before observation submission. An in-progress recording can still be lost on browser/device shutdown. Unsaved briefing, observation, decision, reflection and debrief text recovers on returning to the screen; drafts are not approvals or submissions and are excluded from portable backups. Typed capture stays available after microphone failure. Browser dictation is optional and may use an online browser service; the app does not supply an offline speech model.

Each trip is limited to 90 dates. Each journal is limited to 5,000 events / 15 million JSON characters. Attachments are capped at 20 MB each, full backups at 100 MB. Export day records and original files individually if a full backup exceeds the cap. Browser quota limits vary; a failed save is shown as an error, not success.

Backups are plaintext private-inclusive files, explicitly labeled. They restore matching history or a newer continuation, not divergent records from independently edited copies. Keep backups somewhere safe before clearing browser data or changing site origins. Previous scaffold records remain in their original database and are not silently mapped to trips.

## Verification

`npm run check` checks package boundaries, TypeScript, package-owned unit tests, native screen interaction tests, and the production build. `npm run test:e2e` builds and runs desktop (1440 px) and mobile/touch (390 px) Chromium scenarios. They exercise offline workflows, approval revisions, database-scope separation, multiple dates, GPX and recording recovery, backups, invalid input, microphone denial, and day moves. Mobile viewport testing is not a claim that every mobile browser supports the same recording/transcription capabilities.

See [ADR 0002](../architecture/decisions/0002-solo-event-journals-and-react-ui.md) for event append, recovery, and storage tradeoffs.

## Window and storage behavior

The PWA works in a normal resizable browser window, installed standalone mode, and browser-supported fullscreen. The fullscreen control is shown only when supported; installation and fullscreen are optional. Safe-area spacing supports mobile displays. Storage settings show browser quota/persistence information when available; native settings show available disk space. Back up saved records before clearing data or uninstalling. See the [real-device checklist](../device-testing-checklist.md) for pending hardware verification.

Native and mobile PWA follow the [shared mobile experience](../architecture/mobile-experience.md), including the same daily destinations and route/export placement. Desktop retains every destination with a wider layout.
