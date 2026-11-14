import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  webServer: { command: 'npm run preview -w @open-mountain/pwa -- --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: false },
  use: {
    baseURL: 'http://localhost:4173',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox'] }
      : {}
  }
});
