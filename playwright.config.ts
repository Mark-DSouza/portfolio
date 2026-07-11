import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 8788);

/**
 * E2E seam: real browser over HTTP against the fixture site, served by
 * wrangler with the production wrangler.jsonc semantics (tests/e2e/serve.ts
 * builds and serves; this config owns its lifecycle).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // schema/output are browserless (build guards, HTTP fetches, fs globs):
    // viewport-irrelevant, and the schema builds would race two workers over
    // the same variant output dir if run per-project.
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      testIgnore: ['**/schema.spec.ts', '**/output.spec.ts'],
    },
  ],
  webServer: {
    command: 'bun tests/e2e/serve.ts',
    // Single owner of the port: serve.ts reads it from this env, so the
    // polled url above can never drift from where the server listens.
    env: { E2E_PORT: String(PORT) },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
