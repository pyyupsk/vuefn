import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e-dev',
  forbidOnly: !!process.env.CI,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4175' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'vite dev --host 127.0.0.1 --port 4175 --strictPort',
    url: 'http://127.0.0.1:4175',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
