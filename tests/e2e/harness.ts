import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

/** Absolute output dir of a fixture-build variant, for filesystem assertions. */
export function fixtureDist(variant: string): string {
  return join(ROOT, 'dist-test', variant);
}

/**
 * Fixture-build seam: run the real production build against mock content
 * (tests/fixtures/content unless a variant supplies its own). The e2e server
 * builds and serves the `e2e` variant; schema-guard tests build throwaway
 * variants and assert the failure. Node APIs only — this runs under both bun
 * (serve.ts) and Playwright's Node runtime (spec files).
 *
 * This harness owns the build dir protocol; callers never touch it:
 * - OUT_DIR and CACHE_DIR are derived per variant. The cache split is
 *   load-bearing: Astro's content-layer store persists across builds and
 *   would leak fixture pages into real output (or across variants) if shared.
 * - The variant's output dir is wiped before building so absence assertions
 *   can never pass against stale output from a previous run. The cache dir is
 *   kept for build speed.
 *
 * Builds are environment-independent (ADR-0001 retired the Draft concept, the
 * only env-sensitive behavior), so no deploy-environment vars need forcing or
 * stripping here. TZ is the deliberate exception: it is forced to a hostile
 * timezone *because* builds must be environment-independent — CI and most dev
 * machines sit at UTC or east of it, where an unpinned date format still
 * renders the right calendar day, so only a west-of-UTC build can prove the
 * UTC pinning in formatDate. Etc/GMT+12 is UTC-12 (POSIX signs invert): fixed
 * offset, no DST, and every UTC-midnight frontmatter date renders a day early
 * if the pin is lost.
 */
export function buildFixtureSite(variant: string, opts: { contentDir?: string } = {}): void {
  rmSync(fixtureDist(variant), { recursive: true, force: true });

  const result = spawnSync('bun', ['run', 'build'], {
    cwd: ROOT,
    encoding: 'utf8',
    env: {
      ...process.env,
      CONTENT_DIR: opts.contentDir ?? './tests/fixtures/content',
      OUT_DIR: `./dist-test/${variant}`,
      CACHE_DIR: `./.astro-test/${variant}`,
      TZ: 'Etc/GMT+12',
    },
  });
  if (result.status !== 0) {
    throw new Error(`astro build (${variant} variant) failed:\n${result.stdout}\n${result.stderr}`);
  }
}
