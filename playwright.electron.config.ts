import { defineConfig } from '@playwright/test';

// Electron-side tests. The browser suite in playwright.config.ts covers the UI
// against `ng serve`; this one covers the packaged-app path, where node
// definitions come off disk instead of the bundle. There is no webServer and no
// browserName: each test launches Electron itself via _electron.
export default defineConfig({
  testDir: './e2e-electron',
  timeout: 90_000,
  workers: 1,
  fullyParallel: false,
  reporter: [['list']],
});
