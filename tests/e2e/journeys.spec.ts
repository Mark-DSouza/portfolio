import { expect, test } from '@playwright/test';

// Expected values are hardcoded from the fixture literals in
// tests/fixtures/content (testing model: mock content only).

test('a visitor clicks from the landing Featured card to its Case study', async ({ page }) => {
  await page.goto('/');

  // The Featured fixture project renders as a landing-page card.
  await page.getByRole('link', { name: 'Fixture Flagship' }).click();

  // The card links /projects/flagship; production semantics 307 it to the
  // trailing-slash canonical URL before the Case study renders.
  await expect(page).toHaveURL(/\/projects\/flagship\/$/);
  await expect(page.getByRole('heading', { name: 'Fixture Flagship' })).toBeVisible();
  await expect(page.locator('body')).toContainText('fixture-flagship-body');
});
