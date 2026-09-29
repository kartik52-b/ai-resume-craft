const { defineConfig } = require('@playwright/test');

/**
 * E2E configuration.
 *
 * Plain CJS (`.cjs`) so Playwright's config loader takes its `require()` path
 * — the ESM loader writes a `<file>.esm.preflight` companion file, which fails
 * on read-only or sandboxed filesystems. The contents are equivalent to the
 * previous ESM config.
 *
 * Tests run against the production build served by `vite preview`.
 */
const config = {
  testDir: './e2e',
  testMatch: '*.e2e.cjs',
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
};

module.exports = defineConfig(config);
