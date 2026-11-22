import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  base: '/',
  build: {rollupOptions: {
    // Client-component directives are irrelevant in this client-only Vite SPA.
    onwarn(warning, warn) {if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) return; warn(warning);},
    output: {manualChunks: {ui: ['react','react-dom','@mui/material/Button','@mui/material/Paper','@mui/material/TextField','@mui/material/styles','@mui/material/CssBaseline'], persistence: ['pouchdb-browser']}},
  }},
  define: { global: 'globalThis' },
  plugins: [VitePWA({
    registerType: 'prompt',
    manifest: { name: 'Backcountry Ops', short_name: 'Backcountry Ops', description: 'Backcountry Ops: offline trip planning, daily briefings, and field observations.',
      theme_color: '#173f37', background_color: '#f5f4ee', display: 'standalone', start_url: './',
      icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }] },
    workbox: { clientsClaim: true, globPatterns: ['**/*.{js,css,html,svg,webmanifest}'] }
  })]
});
