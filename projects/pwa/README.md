# Local-only PWA

From the repository root, run `npm ci`, then `npm run dev`. Open the URL Vite prints. Run `npm run build` for a production build and `npm run preview` to serve it locally. Deploy `projects/pwa/dist/` to any static host using HTTPS (localhost also works for development).

No API, CouchDB instance, environment variables, remote account, or external data service is required. The app uses PouchDB in the browser. Create trips, daily records, and observations; switch local users and organizations; add memberships; export and import backups. Records are shared between members of the same local organization.

The production build includes a service worker that caches the app shell. Load the production site once online and allow the service worker to activate before testing offline reloads. Vite development mode does not provide the production offline cache. Initial installation still requires downloading the static files. No map or weather provider is configured.

Data is specific to the browser profile and site origin, so development and preview ports have separate stores. Export backups before clearing browser storage or moving hosts. Local profiles and memberships do not provide secure authentication. Import adds missing records and skips existing identifiers; it does not merge edits. Membership management is unrestricted on the local device.

## Verification

Run `npm test` for domain and organization-context checks. For browser tests, run `npx playwright install chromium`, then `npm run test:e2e`. The command builds fresh production assets and the test configuration starts its own static preview server automatically. Stop any existing server on port 4173 first. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` if using an existing Chromium installation.

The browser test covers local persistence after reload, organization switching, all three workflows, and creating a record after an offline reload.
