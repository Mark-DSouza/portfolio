import { expect, test } from '@playwright/test';

/** Same-origin URLs without a file extension are pages; the rest are assets. */
function isPageLink(pathname: string): boolean {
  return pathname.endsWith('.html') || !pathname.includes('.');
}

/** Canonical page path: the trailing-slash form the server 307s to. */
function normalizePage(pathname: string): string {
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

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

  async function checkAsset(pathname: string) {
    if (checkedAssets.has(pathname)) return;
    checkedAssets.add(pathname);
    const response = await request.get(pathname);
    if (response.status() >= 400) failures.push(`${pathname} -> ${response.status()}`);
  }

  while (queue.length > 0) {
    const path = queue.shift()!;
    if (seenPages.has(path)) continue;
    seenPages.add(path);

    const response = await page.goto(path);
    if (!response || response.status() >= 400) {
      failures.push(`${path} -> ${response?.status() ?? 'no response'}`);
      continue;
    }

    // Enqueue same-origin page links; fetch (don't navigate) same-origin
    // assets: images, feeds, the resume PDF. External links are not ours to prove.
    const hrefs = await page.locator('a[href]').evaluateAll((anchors) =>
      anchors.map((a) => (a as HTMLAnchorElement).href)
    );
    const imgSrcs = await page.locator('img[src]').evaluateAll((imgs) =>
      imgs.map((img) => (img as HTMLImageElement).src)
    );

    for (const href of hrefs) {
      const url = new URL(href);
      if (url.origin !== origin) continue;
      if (isPageLink(url.pathname)) queue.push(normalizePage(url.pathname));
      else await checkAsset(url.pathname);
    }
    for (const src of imgSrcs) {
      const url = new URL(src);
      if (url.origin === origin) await checkAsset(url.pathname);
    }
  }

  expect(failures).toEqual([]);

  // The exact page set is determined by the fixture literals: if a page drops
  // out of the link graph (or an unexpected one appears), the crawl must say so.
  expect([...seenPages].sort()).toEqual(
    [
      '/',
      '/blog/',
      '/blog/published-alpha/',
      '/blog/published-beta/',
      '/blog/tags/fixture-alpha-tag/',
      '/blog/tags/fixture-shared-tag/',
      '/projects/',
      '/projects/flagship/',
      '/projects/older/',
      '/projects/pinned/',
      '/projects/recent/',
    ].sort()
  );
});
