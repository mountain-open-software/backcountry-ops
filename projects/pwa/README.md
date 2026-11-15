# Solo mobile and desktop PWA

From the repository root:

```sh
npm ci
npm run dev
```

Use the URL Vite prints. No API, account, password, CouchDB server, AI service, or environment file is needed. Set a username and local community, create a trip, and work through briefing, observations, debrief/closing, and timeline. Normal React/TypeScript forms are used; JSON customization is deferred.

```sh
npm run check
npm run preview
```

Deploy `projects/pwa/dist/` to a static HTTPS host. The production service worker caches the app shell after an initial online visit. Test offline using the production preview; development mode does not provide the production cache. Reload after the first online visit before disconnecting. Browser storage is origin-specific: different ports/hosts have different data.

Use the microphone button for audio capture and optional browser dictation when available. Stop and save recordings explicitly; unfinished previews are not durable. Transcription may need a browser-provided online service. No offline transcription, background microphone capture, or GPS track recording is promised. Upload GPX or link to an external navigation app instead.

See [implemented features and limits](../../docs/product/solo-version-implementation.md) and [ADR 0002](../../docs/architecture/decisions/0002-solo-event-journals-and-react-ui.md). Public day exports exclude private notes. Full backups explicitly include private notes and original attachments; keep them private. The previous scaffold database remains intact and can be exported through settings.

## Browser verification

```sh
npx playwright install chromium
npm run test:e2e
```

The command builds production assets and owns its preview server on port 4173; stop another preview first. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use an installed Chromium. Tests run desktop and mobile/touch viewports, including offline closure, corrections, backup recovery, GPX, audio, and denied permissions. Hardware/mobile browser support should still be checked on target devices.
