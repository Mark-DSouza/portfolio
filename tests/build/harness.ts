import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '../..');

export interface FixtureSite {
  /** Rendered HTML of the page at the given route segments. */
  html(...path: string[]): string;
  /** Whether a page exists at the given route segments. */
  exists(...path: string[]): boolean;
  /** Contents of a non-page output file (rss.xml, sitemap-index.xml, …). */
  file(name: string): string;
  /** Absolute output dir, for raw-file and glob-style assertions. */
  dist: string;
}

/**
 * Build-and-inspect seam: run the real production build against mock content
 * (tests/fixtures/content unless a variant supplies its own), then assert over
 * the generated output. Expected values are hardcoded from the fixture
 * literals.
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
 * stripping here.
 */
export function buildFixtureSite(
  variant: string,
  opts: { contentDir?: string } = {}
): FixtureSite {
  const dist = join(ROOT, 'dist-test', variant);
  rmSync(dist, { recursive: true, force: true });

  const result = Bun.spawnSync(['bun', 'run', 'build'], {
    cwd: ROOT,
    env: {
      ...process.env,
      CONTENT_DIR: opts.contentDir ?? './tests/fixtures/content',
      OUT_DIR: `./dist-test/${variant}`,
      CACHE_DIR: `./.astro-test/${variant}`,
    },
    stdout: 'pipe',
    stderr: 'pipe',
  });
  if (result.exitCode !== 0) {
    throw new Error(
      `astro build (${variant} variant) failed:\n${result.stdout.toString()}\n${result.stderr.toString()}`
    );
  }

  return {
    dist,
    html: (...path) => readFileSync(join(dist, ...path, 'index.html'), 'utf8'),
    exists: (...path) => existsSync(join(dist, ...path, 'index.html')),
    file: (name) => readFileSync(join(dist, name), 'utf8'),
  };
}
