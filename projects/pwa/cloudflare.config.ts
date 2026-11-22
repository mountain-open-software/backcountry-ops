import { defineConfig } from 'cf/config';

// Assets only: Vite builds dist/, then `cf deploy ./dist` uploads that directory.
export default defineConfig({
  worker: {
    name: 'open-mountain-pwa',
    compatibilityDate: '2026-11-22',
    assets: { notFoundHandling: 'single-page-application' },
  },
});
