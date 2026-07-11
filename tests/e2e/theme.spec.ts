import { expect, test, type Page } from '@playwright/test';

// The theme toggle is the site's only JavaScript — the one behavior no
// build-output inspection can verify.

declare global {
  interface Window {
    __themeAtFirstFrame?: Promise<string | undefined>;
  }
}

/**
 * Arm the next navigation to record the <html> theme at its first paint
 * opportunity — the static HTML ships data-theme="dark", so a late-running
 * theme script would paint a wrong-theme frame that a settled-state
 * assertion can never see.
 */
function armFirstFrameCapture(page: Page) {
  return page.addInitScript(() => {
    window.__themeAtFirstFrame = new Promise((resolve) =>
      requestAnimationFrame(() => resolve(document.documentElement.dataset.theme))
    );
  });
}

function themeAtFirstFrame(page: Page) {
  return page.evaluate(() => window.__themeAtFirstFrame);
}

test('a first visit renders dark with no wrong-theme flash', async ({ page }) => {
  // Each test gets a fresh browser context: no stored theme, a true first visit.
  await armFirstFrameCapture(page);
  await page.goto('/');
  expect(await themeAtFirstFrame(page)).toBe('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('the toggled theme persists across navigation and a reload, with no flash', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Toggle color theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  // Persists across a click-through navigation…
  await page.getByRole('link', { name: 'Blog' }).click();
  await expect(page).toHaveURL(/\/blog\/$/);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  // …and across a full reload, applied before the first frame paints.
  await armFirstFrameCapture(page);
  await page.reload();
  expect(await themeAtFirstFrame(page)).toBe('light');
});

test('toggling back to dark also persists', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Toggle color theme' });
  await toggle.click();
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
