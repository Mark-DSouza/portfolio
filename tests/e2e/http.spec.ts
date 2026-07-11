import { expect, test } from '@playwright/test';

// HTTP-level truths: behaviors that exist only in how the server answers, not
// in any built file. Serving semantics come from wrangler.jsonc (ADR-0002).

test('a mistyped URL answers with a real 404 status carrying the styled page', async ({
  page,
}) => {
  const response = await page.goto('/definitely-not-a-page');
  expect(response?.status()).toBe(404);
  // The styled 404 renders inside the real Layout, not a blank error body.
  await expect(page.locator('body')).toContainText("This page doesn't exist");
  await expect(page.getByRole('link', { name: '← back home' })).toBeVisible();
});

// Social scrapers fetch raw HTML — they never run a browser, so og:image is
// asserted over HTTP where that consumer meets it.
const ogImageOf = (html: string) =>
  html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];

test('a covered piece carries a resolvable absolute og:image; an uncovered one carries none', async ({
  request,
}) => {
  // Alpha (Post) and flagship (Case study) carry fixture covers.
  for (const path of ['/blog/published-alpha/', '/projects/flagship/']) {
    const ogImage = ogImageOf(await (await request.get(path)).text());
    // Absolute against the production origin: a relative URL is useless to a
    // scraper reading the page off-site.
    expect(ogImage, `og:image on ${path}`).toMatch(/^https:\/\/markdsouza\.dev\//);
    // The fingerprinted asset path must actually resolve to image bytes.
    const asset = await request.get(new URL(ogImage!).pathname);
    expect(asset.status()).toBe(200);
    expect((await asset.body()).subarray(1, 4).toString()).toBe('PNG');
  }

  // Beta has no cover: no og:image may be emitted (a broken/empty one would
  // make scrapers render a dead image instead of falling back to text).
  const beta = await (await request.get('/blog/published-beta/')).text();
  expect(ogImageOf(beta)).toBeUndefined();
});

test('a full page load issues zero JavaScript requests', async ({ page }) => {
  const jsRequests: string[] = [];
  page.on('request', (request) => {
    const isScript = request.resourceType() === 'script';
    const isJsFile = new URL(request.url()).pathname.endsWith('.js');
    if (isScript || isJsFile) jsRequests.push(request.url());
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  // The theme script is inline in <head>; nothing else may execute — the
  // zero-emitted-JS invariant, enforced where a visitor would feel it.
  expect(jsRequests).toEqual([]);
});
