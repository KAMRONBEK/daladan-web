import { defineConfig, devices } from '@playwright/test'

const chrome = devices['Desktop Chrome']

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium-site',
      testMatch: 'site/**/*.spec.ts',
      use: {
        ...chrome,
        baseURL: 'http://127.0.0.1:5199',
      },
    },
    {
      name: 'chromium-admin',
      testMatch: 'admin/**/*.spec.ts',
      use: {
        ...chrome,
        baseURL: 'http://127.0.0.1:5200',
      },
    },
  ],
  webServer: [
    {
      name: 'site',
      command: 'yarn dev:e2e',
      url: 'http://127.0.0.1:5199',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      name: 'admin',
      command: 'yarn dev:e2e-admin',
      url: 'http://127.0.0.1:5200',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
