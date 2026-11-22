# Backcountry Ops — mobile and desktop PWA

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

## Cloudflare Workers static hosting

`cloudflare.config.ts` configures an assets-only Worker, named `open-mountain-pwa`, with SPA fallback to `index.html`. Change `worker.name` to match your existing Cloudflare Worker before deploying. The normal Vite build remains independent of Cloudflare; no API or Worker JavaScript entrypoint is needed.

From the repository root:

```sh
npm ci
npm run check:cloudflare  # Build and validate the static deployment without uploading
npm run deploy:pwa       # Build and deploy using your Cloudflare credentials
```

For the Cloudflare Workers Git build settings:

| Setting | Value |
| --- | --- |
| Root directory | Repository root (`/`) |
| Build command | `npm run build -w @open-mountain/pwa` |
| Deploy command | `npm run deploy -w @open-mountain/pwa` |
| Static assets directory | `projects/pwa/dist` (passed as `./dist` from the PWA workspace) |

Workers does not require the separate Pages output-directory setting. The deploy command uses the pinned project-local Cloudflare CLI and reads the configuration from the PWA workspace. For local deployment, authenticate the CLI first; unattended deployment uses Cloudflare's build credentials or `CLOUDFLARE_API_TOKEN`. Credentials stay outside this repository.

The PWA is served at the host root, with absolute asset URLs so nested SPA links can load their JavaScript and CSS. `public/_headers` tells browsers to revalidate the shell/service worker and caches Vite's hashed assets for a year. The application service worker still provides offline access after the initial online visit.

References: [Cloudflare static directory deployment](https://developers.cloudflare.com/cf/projects/#deploy-a-static-assets-directory), [configuration](https://developers.cloudflare.com/cf/projects/cloudflare-config/), and [static response headers](https://developers.cloudflare.com/workers/static-assets/headers/).

Use the microphone button for audio capture and optional browser dictation when available. Stop and save recordings explicitly; unfinished previews are not durable. Transcription may need a browser-provided online service. No offline transcription, background microphone capture, or GPS track recording is promised. Upload GPX or link to an external navigation app instead.

See [implemented features and limits](../../docs/product/solo-version-implementation.md) and [ADR 0002](../../docs/architecture/decisions/0002-solo-event-journals-and-react-ui.md). Public day exports exclude private notes. Full backups explicitly include private notes and original attachments; keep them private. The previous scaffold database remains intact and can be exported through settings.

## Browser verification

```sh
npx playwright install chromium
npm run test:e2e
```

The command builds production assets and owns its preview server on port 4173; stop another preview first. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use an installed Chromium. Tests run desktop and mobile/touch viewports, including offline closure, corrections, backup recovery, GPX, audio, and denied permissions. Hardware/mobile browser support should still be checked on target devices.

Use **Settings** in the header to edit your profile, manage communities (create/list/select/rename/delete), or export backups. Community display names are separate from their lowercase, hyphenated IDs. Confirmed deletion hides a community from active use while retaining its history in full backups.

The home screen is the offline assistant: enter supported sentences, choose **Process notes**, review the changes, and **Save reviewed changes**. **Trip data** opens the existing editors in a side panel (desktop) or drawer (mobile). Use your keyboard microphone for dictation where available; offline dictation requires device support. The text processor is local and uses explicit English phrases, not a remote AI service. See Supported offline phrases in the app.

**On-device AI** in Settings is off by default. Enabling it does not download anything; choose Download local model separately (about 106 MB plus 11 MB browser runtime). It classifies unsupported short field notes locally. Dictate note offers local browser speech when supported, with a separate opt-in for online speech. All submitted notes and status transitions are retained privately and included in full backups. See [local AI architecture](../../docs/architecture/on-device-ai.md).

### App updates

The app checks for a new service worker on launch, hourly while visible, and when returning to the foreground or reconnecting. A waiting release shows **Update app**. Finish recording/processing first; the update waits for mounted draft writes and refuses to reload if a draft failed to save. It does not erase user databases, attachments or downloaded models. Updates require confirmation so an active field session is not reloaded unexpectedly. The shell/service-worker responses revalidate; hashed assets remain immutable.

For installations from before the update prompt existed, open the app online to download the release, then close **all** tabs and installed-app windows for this site and reopen it. This allows the waiting worker to activate. Do not clear site data: it contains local-only records. Verify the production build with `npx playwright test tests/pwa-update.spec.js`; this serves two worker versions and checks activation, draft recovery and offline use.
