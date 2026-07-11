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

test('a visitor walks landing → blog → Post → Tag page → back to the index', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Blog', exact: true }).click();
  await expect(page).toHaveURL(/\/blog\/$/);

  await page.getByRole('link', { name: 'Fixture Beta' }).click();
  await expect(page).toHaveURL(/\/blog\/published-beta\/$/);
  await expect(page.locator('body')).toContainText('fixture-beta-body');

  // The shared tag's pill leads to a Tag page listing both fixture posts.
  await page.getByRole('link', { name: 'fixture-shared-tag' }).click();
  await expect(page).toHaveURL(/\/blog\/tags\/fixture-shared-tag\/$/);
  await expect(page.getByRole('link', { name: 'Fixture Beta' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Fixture Alpha' })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/blog\/published-beta\/$/);
});

test('the blog index lists posts newest first', async ({ page }) => {
  await page.goto('/blog/');
  const posts = page.locator('main a[href*="/blog/published-"]');
  // Beta (2026-02-10) is newer than Alpha (2026-01-05).
  await expect(posts.first()).toContainText('Fixture Beta');
  await expect(posts.last()).toContainText('Fixture Alpha');
});

test('the projects index renders Featured → Priority → date order', async ({ page }) => {
  await page.goto('/projects/');
  const cards = page.locator('main a[href*="/projects/"]');
  // flagship (featured) → pinned (priority 5) → recent (2025) → older (2024).
  await expect(cards).toHaveCount(4);
  await expect(cards.nth(0)).toContainText('Fixture Flagship');
  await expect(cards.nth(1)).toContainText('Fixture Pinned');
  await expect(cards.nth(2)).toContainText('Fixture Recent');
  await expect(cards.nth(3)).toContainText('Fixture Older');
});

test('the landing page shows Featured cards only, plus the contact links', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Fixture Flagship' })).toBeVisible();
  // Non-Featured projects do not surface on the landing page.
  await expect(page.locator('a[href*="/projects/pinned"]')).toHaveCount(0);

  await expect(page.locator('a[href="mailto:markdsouza434@gmail.com"]').first()).toBeVisible();
  await expect(page.locator('a[href="/resume.pdf"]').first()).toBeVisible();
  await expect(
    page.locator('a[href="https://github.com/Mark-DSouza"]').first()
  ).toBeVisible();
  await expect(
    page.locator('a[href="https://www.linkedin.com/in/mark-philip-dsouza/"]').first()
  ).toBeVisible();
});

test('a Case study shows its repo link, Demo link, and an honest status badge', async ({
  page,
}) => {
  // Flagship has a Demo and is in progress: both must show.
  await page.goto('/projects/flagship/');
  await expect(page.getByRole('link', { name: 'View code →' })).toHaveAttribute(
    'href',
    'https://github.com/example/flagship'
  );
  await expect(page.getByRole('link', { name: 'Live demo →' })).toHaveAttribute(
    'href',
    'https://flagship.example.com'
  );
  await expect(page.locator('main')).toContainText('in progress');

  // Pinned has no Demo and shipped: no Demo link, no in-progress badge.
  await page.goto('/projects/pinned/');
  await expect(page.getByRole('link', { name: 'View code →' })).toHaveAttribute(
    'href',
    'https://github.com/example/pinned'
  );
  await expect(page.getByRole('link', { name: 'Live demo →' })).toHaveCount(0);
  await expect(page.locator('main')).toContainText('shipped');
  await expect(page.locator('main')).not.toContainText('in progress');
});
