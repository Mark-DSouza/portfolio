import { beforeAll, describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { XMLValidator } from 'fast-xml-parser';
import { buildFixtureSite, type FixtureSite } from './harness';

const ROOT = join(import.meta.dirname, '../..');

let site: FixtureSite;
beforeAll(() => {
  site = buildFixtureSite('production');
}, 120_000);

describe('blog', () => {
  test('every published post gets a page containing its body', () => {
    expect(site.html('blog', 'published-alpha')).toContain('fixture-alpha-body');
    expect(site.html('blog', 'published-beta')).toContain('fixture-beta-body');
  });

  test('the blog index lists published posts, newest first', () => {
    const index = site.html('blog');
    const alpha = index.indexOf('/blog/published-alpha');
    const beta = index.indexOf('/blog/published-beta');
    expect(alpha).toBeGreaterThan(-1);
    expect(beta).toBeGreaterThan(-1);
    expect(beta).toBeLessThan(alpha); // beta (2026-02-10) is newer than alpha (2026-01-05)
  });

  test('every tag on a published post gets a tag page listing its posts', () => {
    const shared = site.html('blog', 'tags', 'fixture-shared-tag');
    expect(shared).toContain('/blog/published-alpha');
    expect(shared).toContain('/blog/published-beta');

    const alphaOnly = site.html('blog', 'tags', 'fixture-alpha-tag');
    expect(alphaOnly).toContain('/blog/published-alpha');
    expect(alphaOnly).not.toContain('/blog/published-beta');
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
      const study = site.html('projects', id);
      expect(study).toContain(sentinel);
      expect(study).toContain(repo);
    }
  });

  test('the demo link renders only for projects that have one', () => {
    expect(site.html('projects', 'flagship')).toContain('https://flagship.example.com');
    expect(site.html('projects', 'pinned')).not.toContain('example.com');
  });

  test('an in-progress project is badged honestly on its case study', () => {
    expect(site.html('projects', 'flagship')).toMatch(/in.progress/i);
    expect(site.html('projects', 'pinned')).not.toMatch(/in.progress/i);
  });

  test('the projects index orders by featured, then priority, then date', () => {
    const index = site.html('projects');
    const order = ['flagship', 'pinned', 'recent', 'older'].map((id) =>
      index.indexOf(`/projects/${id}`)
    );
    expect(Math.min(...order)).toBeGreaterThan(-1);
    expect(order).toEqual(order.toSorted((a, b) => a - b));
  });
});

describe('landing', () => {
  test('featured projects appear as cards; non-featured do not', () => {
    const landing = site.html();
    expect(landing).toContain('/projects/flagship');
    expect(landing).not.toContain('/projects/pinned');
  });

  test('contact email, resume, GitHub, and LinkedIn links are present', () => {
    const landing = site.html();
    expect(landing).toContain('markdsouza434@gmail.com');
    expect(landing).toContain('/resume.pdf');
    expect(landing).toContain('https://github.com/Mark-DSouza');
    expect(landing).toContain('https://www.linkedin.com/in/mark-philip-dsouza/');
  });
});

describe('frontmatter strictness', () => {
  // Schemas are .strict(): a misspelled key fails the build instead of being
  // silently stripped (a typo'd `tags:` would otherwise just lose the tags).
  test(
    'an unrecognized frontmatter key fails the build',
    () => {
      expect(() =>
        buildFixtureSite('typo-key', { contentDir: './tests/fixtures/typo-key-content' })
      ).toThrow(/unrecognized key/i);
    },
    120_000
  );
});

describe('draft retirement', () => {
  // The Draft concept is retired (ADR-0001): git branches are the draft
  // mechanism. A leftover `draft:` key must fail the build loudly so a post
  // the author believed hidden can never silently publish.
  test(
    'a stray draft: key fails the build with a retirement error',
    () => {
      expect(() =>
        buildFixtureSite('draft-key', { contentDir: './tests/fixtures/draft-key-content' })
      ).toThrow(/draft.*retired[\s\S]*unmerged branch/i);
    },
    120_000
  );
});

describe('feeds and output hygiene', () => {
  test('the RSS feed is well-formed XML carrying every post', () => {
    const rss = site.file('rss.xml');
    expect(XMLValidator.validate(rss)).toBe(true);
    expect(rss).toContain('<rss');
    expect(rss).toContain('/blog/published-alpha');
    expect(rss).toContain('/blog/published-beta');
  });

  test('a well-formed sitemap is generated', () => {
    expect(XMLValidator.validate(site.file('sitemap-index.xml'))).toBe(true);
  });

  // The resume PDF is a launch-gate input owed by Mark; the assertion arms
  // itself the moment the file lands in public/.
  test.skipIf(!existsSync(join(ROOT, 'public/resume.pdf')))(
    'the resume PDF ships in the output',
    () => {
      expect(existsSync(join(site.dist, 'resume.pdf'))).toBe(true);
    }
  );

  test('a styled 404 page is generated', () => {
    expect(existsSync(join(site.dist, '404.html'))).toBe(true);
  });

  test('no framework JavaScript is emitted — the site ships zero JS files', () => {
    const jsFiles = [...new Bun.Glob('**/*.js').scanSync({ cwd: site.dist })];
    expect(jsFiles).toEqual([]);
  });
});
