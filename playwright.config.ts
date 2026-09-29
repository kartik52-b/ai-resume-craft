import { defineConfig } from '@playwright/test';

/**
 * E2E configuration (rebuilt in Phase 14; the Phase 1 audit removed the
 * original config because it imported a non-existent package).
 *
 * Tests run against the production build served by `vite preview`, with the
 * optional AI proxy NOT running — so AI buttons exercise the real
 * "not configured" failure path.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '*.e2e.ts',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'bun run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
