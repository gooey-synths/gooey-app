import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e', // Specify the folder where your tests are located
  use: {
    // Configure the browser to run in headless mode (perfect for CI)
    headless: true,
    viewport: { width: 1280, height: 720 },
    baseURL: 'http://localhost:4200',
    // You can enable more configurations like timeout, browser settings, etc.
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
  },
});
