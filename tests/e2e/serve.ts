import { buildFixtureSite } from '../build/harness';

/**
 * E2E web server, owned by playwright.config.ts (its webServer block runs and
 * reaps this; don't start it by hand). Builds the fixture site through the
 * harness — the single owner of the build dir protocol — then serves it with
 * `wrangler dev`, so serving semantics (trailing slashes, styled 404) come
 * from wrangler.jsonc: the same file production deploys use. The --assets
 * flag overrides only the directory; the config's html_handling /
 * not_found_handling still apply (verified empirically against production).
 */
buildFixtureSite('e2e');

const port = process.env.E2E_PORT ?? '8788';
const server = Bun.spawn(
  ['bunx', 'wrangler', 'dev', '--assets', './dist-test/e2e', '--port', port],
  { stdout: 'inherit', stderr: 'inherit' }
);
process.exit(await server.exited);
