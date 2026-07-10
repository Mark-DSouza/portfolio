import { beforeAll, describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { XMLValidator } from 'fast-xml-parser';

/**
 * Build-and-inspect seam: run the real production build against the mock
 * content in tests/fixtures/content, then assert over the generated output.
 * Expected values are hardcoded from the fixture literals.
 */
const ROOT = join(import.meta.dirname, '../..');
const DIST = join(ROOT, 'dist-test');

const html = (...segments: string[]) => readFileSync(join(DIST, ...segments, 'index.html'), 'utf8');
const page = (...segments: string[]) => join(DIST, ...segments, 'index.html');

beforeAll(() => {
  const result = Bun.spawnSync(['bun', 'run', 'build'], {
    cwd: ROOT,
    env: {
      ...process.env,
      // bun test sets NODE_ENV=test; the child build must be a real production build
      NODE_ENV: 'production',
      CONTENT_DIR: './tests/fixtures/content',
      OUT_DIR: './dist-test',
      CACHE_DIR: './.astro-test',
    },
    stdout: 'pipe',
    stderr: 'pipe',
  });
  if (result.exitCode !== 0) {
    throw new Error(`astro build failed:\n${result.stdout.toString()}\n${result.stderr.toString()}`);
  }
}, 120_000);

describe('blog', () => {
  test('every published post gets a page containing its body', () => {
    expect(html('blog', 'published-alpha')).toContain('fixture-alpha-body');
    expect(html('blog', 'published-beta')).toContain('fixture-beta-body');
  });

  test('the blog index lists published posts, newest first', () => {
    const index = html('blog');
    const alpha = index.indexOf('/blog/published-alpha');
    const beta = index.indexOf('/blog/published-beta');
    expect(alpha).toBeGreaterThan(-1);
    expect(beta).toBeGreaterThan(-1);
    expect(beta).toBeLessThan(alpha); // beta (2026-02-10) is newer than alpha (2026-01-05)
  });

  test('draft posts appear nowhere in the production output', () => {
    expect(existsSync(page('blog', 'draft-gamma'))).toBe(false);
    expect(html('blog')).not.toContain('draft-gamma');
    expect(html('blog')).not.toContain('Fixture Gamma');
  });

  test('every tag on a published post gets a tag page listing its posts', () => {
    const shared = html('blog', 'tags', 'fixture-shared-tag');
    expect(shared).toContain('/blog/published-alpha');
    expect(shared).toContain('/blog/published-beta');

    const alphaOnly = html('blog', 'tags', 'fixture-alpha-tag');
    expect(alphaOnly).toContain('/blog/published-alpha');
    expect(alphaOnly).not.toContain('/blog/published-beta');
  });

  test('tags used only by drafts get no tag page', () => {
    expect(existsSync(page('blog', 'tags', 'fixture-draft-only-tag'))).toBe(false);
  });
});

describe('projects', () => {
  test('every project gets a case study page with its body and repo link', () => {
    for (const [id, sentinel, repo] of [
      ['flagship', 'fixture-flagship-body', 'https://github.com/example/flagship'],
      ['pinned', 'fixture-pinned-body', 'https://github.com/example/pinned'],
      ['recent', 'fixture-recent-body', 'https://github.com/example/recent'],
      ['older', 'fixture-older-body', 'https://github.com/example/older'],
    ] as const) {
      const study = html('projects', id);
      expect(study).toContain(sentinel);
      expect(study).toContain(repo);
    }
  });

  test('the demo link renders only for projects that have one', () => {
    expect(html('projects', 'flagship')).toContain('https://flagship.example.com');
    expect(html('projects', 'pinned')).not.toContain('example.com');
  });

  test('an in-progress project is badged honestly on its case study', () => {
    expect(html('projects', 'flagship')).toMatch(/in.progress/i);
    expect(html('projects', 'pinned')).not.toMatch(/in.progress/i);
  });

  test('the projects index orders by featured, then priority, then date', () => {
    const index = html('projects');
    const order = ['flagship', 'pinned', 'recent', 'older'].map((id) =>
      index.indexOf(`/projects/${id}`)
    );
    expect(Math.min(...order)).toBeGreaterThan(-1);
    expect(order).toEqual(order.toSorted((a, b) => a - b));
  });
});

describe('landing', () => {
  test('featured projects appear as cards; non-featured do not', () => {
    const landing = html();
    expect(landing).toContain('/projects/flagship');
    expect(landing).not.toContain('/projects/pinned');
  });

  test('contact email and resume link are present', () => {
    const landing = html();
    expect(landing).toContain('markdsouza434@gmail.com');
    expect(landing).toContain('/resume.pdf');
  });
});

describe('feeds and output hygiene', () => {
  test('the RSS feed is well-formed XML carrying published posts only', () => {
    const rss = readFileSync(join(DIST, 'rss.xml'), 'utf8');
    expect(XMLValidator.validate(rss)).toBe(true);
    expect(rss).toContain('<rss');
    expect(rss).toContain('/blog/published-alpha');
    expect(rss).toContain('/blog/published-beta');
    expect(rss).not.toContain('draft-gamma');
  });

  test('a well-formed sitemap is generated', () => {
    const sitemap = readFileSync(join(DIST, 'sitemap-index.xml'), 'utf8');
    expect(XMLValidator.validate(sitemap)).toBe(true);
  });

  // The resume PDF is a launch-gate input owed by Mark; the assertion arms
  // itself the moment the file lands in public/.
  test.skipIf(!existsSync(join(ROOT, 'public/resume.pdf')))(
    'the resume PDF ships in the output',
    () => {
      expect(existsSync(join(DIST, 'resume.pdf'))).toBe(true);
    }
  );

  test('a styled 404 page is generated', () => {
    expect(existsSync(join(DIST, '404.html'))).toBe(true);
  });

  test('no framework JavaScript is emitted — the site ships zero JS files', () => {
    const jsFiles = [...new Bun.Glob('**/*.js').scanSync({ cwd: DIST })];
    expect(jsFiles).toEqual([]);
  });
});
