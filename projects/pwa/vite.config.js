import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  base: './',
  define: { global: 'globalThis' },
  plugins: [VitePWA({
    registerType: 'prompt',
    manifest: { name: 'Open Mountain', short_name: 'Open Mountain', description: 'Local-first backcountry planning',
      theme_color: '#173f37', background_color: '#f5f4ee', display: 'standalone', start_url: './',
      icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }] },
    workbox: { clientsClaim: true, globPatterns: ['**/*.{js,css,html,svg,webmanifest}'] }
  })]
});
