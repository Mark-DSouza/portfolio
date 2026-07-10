import { beforeAll, describe, expect, test } from 'bun:test';
import { buildFixtureSite, type FixtureSite } from './harness';

/**
 * Preview variant: on a non-main Cloudflare Pages branch, drafts render
 * everywhere — draft visibility is a property of the build, not of individual
 * routes. Asserts only what differs from the production variant (site.test.ts
 * owns everything else); CF_PAGES_BRANCH is set exactly as Cloudflare sets it
 * on branch deploys.
 */
let site: FixtureSite;
beforeAll(() => {
  site = buildFixtureSite('preview', { env: { CF_PAGES_BRANCH: 'feature-branch' } });
}, 120_000);

describe('preview-branch build', () => {
  test('a draft post gets a page containing its body', () => {
    expect(site.exists('blog', 'draft-gamma')).toBe(true);
    expect(site.html('blog', 'draft-gamma')).toContain('fixture-gamma-sentinel');
  });

  test('the blog index lists the draft', () => {
    expect(site.html('blog')).toContain('/blog/draft-gamma');
  });

  test('a tag used only by a draft gets a tag page listing it', () => {
    expect(site.exists('blog', 'tags', 'fixture-draft-only-tag')).toBe(true);
    expect(site.html('blog', 'tags', 'fixture-draft-only-tag')).toContain('/blog/draft-gamma');
  });

  test('the RSS feed includes the draft', () => {
    expect(site.file('rss.xml')).toContain('/blog/draft-gamma');
  });

  test('published posts still render (preview is a superset, not a swap)', () => {
    expect(site.html('blog', 'published-alpha')).toContain('fixture-alpha-body');
  });
});
