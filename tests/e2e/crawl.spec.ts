import { expect, test } from '@playwright/test';

/**
 * Full-site crawl: spider every same-origin link and image reachable from the
 * landing page and require nothing to 404. Catches the broken cross-reference
 * no per-page assertion is looking for.
 */
test('every internal link and image reachable from the landing page resolves', async ({
  page,
  request,
  baseURL,
}) => {
  const origin = new URL(baseURL!).origin;
  const seenPages = new Set<string>();
  const checkedAssets = new Set<string>();
  const queue = ['/'];
  const failures: string[] = [];

  while (queue.length > 0) {
    const path = queue.shift()!;
    if (seenPages.has(path)) continue;
    seenPages.add(path);

    const response = await page.goto(path);
    if (!response || response.status() >= 400) {
      failures.push(`${path} -> ${response?.status() ?? 'no response'}`);
      continue;
    }

    // Enqueue same-origin page links; fetch (don't navigate) everything else
    // same-origin: images, feeds, the resume PDF.
    const hrefs = await page.locator('a[href]').evaluateAll((anchors) =>
      anchors.map((a) => (a as HTMLAnchorElement).href)
    );
    const imgSrcs = await page.locator('img[src]').evaluateAll((imgs) =>
      imgs.map((img) => (img as HTMLImageElement).src)
    );

    for (const href of hrefs) {
      const url = new URL(href);
      if (url.origin !== origin) continue; // external links are not ours to prove
      if (url.pathname.endsWith('.html') || !url.pathname.includes('.')) {
        queue.push(url.pathname);
      } else if (!checkedAssets.has(url.pathname)) {
        checkedAssets.add(url.pathname);
        const res = await request.get(url.pathname);
        if (res.status() >= 400) failures.push(`${url.pathname} -> ${res.status()}`);
      }
    }
    for (const src of imgSrcs) {
      const url = new URL(src);
      if (url.origin !== origin || checkedAssets.has(url.pathname)) continue;
      checkedAssets.add(url.pathname);
      const res = await request.get(url.pathname);
      if (res.status() >= 400) failures.push(`${url.pathname} -> ${res.status()}`);
    }
  }

  expect(failures).toEqual([]);
  // The crawl must have actually covered the site — a landing page with no
  // links would vacuously pass without this.
  expect(seenPages.size).toBeGreaterThanOrEqual(8);
});
