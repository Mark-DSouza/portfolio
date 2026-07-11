import { expect, test } from '@playwright/test';

// The theme toggle is the site's only JavaScript — the one behavior no
// build-output inspection can verify.

test('a first visit renders in dark', async ({ page }) => {
  // Each test gets a fresh browser context: no stored theme, a true first visit.
  await page.goto('/');
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

  // …and across a full reload. The static HTML ships data-theme="dark", so a
  // late-running theme script would paint a dark frame first: capture the
  // theme at the first paint opportunity to prove it's already flipped.
  await page.addInitScript(() => {
    (window as { __themeAtFirstFrame?: Promise<string | undefined> }).__themeAtFirstFrame =
      new Promise((resolve) =>
        requestAnimationFrame(() => resolve(document.documentElement.dataset.theme))
      );
  });
  await page.reload();
  const themeAtFirstFrame = await page.evaluate(
    () => (window as { __themeAtFirstFrame?: Promise<string | undefined> }).__themeAtFirstFrame
  );
  expect(themeAtFirstFrame).toBe('light');
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
