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
