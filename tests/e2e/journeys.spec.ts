import { expect, test } from '@playwright/test';
import { posts, postsNewestFirst, projects, projectsInOrder, sortedTags, tags, tagPath } from '../fixtures/facts';

// Expected values are hardcoded from the fixture literals in
// tests/fixtures/content (testing model: mock content only); the
// multi-consumer ones are transcribed once in tests/fixtures/facts.ts.

test('a visitor clicks from the landing Featured card to its Case study', async ({ page }) => {
  await page.goto('/');

  // The Featured fixture project renders as a landing-page card.
  await page.getByRole('link', { name: projects.flagship.title }).click();

  // The card links /projects/flagship; production semantics 307 it to the
  // trailing-slash canonical URL before the Case study renders.
  await expect(page).toHaveURL(new RegExp(`${projects.flagship.path}$`));
  await expect(page.getByRole('heading', { name: projects.flagship.title })).toBeVisible();
  await expect(page.locator('body')).toContainText(projects.flagship.sentinel);
});

test('a visitor walks landing → blog → Post → Tag page → back to the index', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Blog', exact: true }).click();
  await expect(page).toHaveURL(/\/blog\/$/);

  await page.getByRole('link', { name: posts.beta.title }).click();
  await expect(page).toHaveURL(new RegExp(`${posts.beta.path}$`));
  await expect(page.locator('body')).toContainText(posts.beta.sentinel);

  // The shared tag's pill leads to a Tag page listing both fixture posts.
  await page.getByRole('link', { name: tags.shared }).click();
  await expect(page).toHaveURL(new RegExp(`${tagPath(tags.shared)}$`));
  await expect(page.getByRole('link', { name: posts.beta.title })).toBeVisible();
  await expect(page.getByRole('link', { name: posts.alpha.title })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${posts.beta.path}$`));
});

test('the blog index lists posts newest first', async ({ page }) => {
  await page.goto('/blog/');
  const cards = page.locator('main a[href*="/blog/published-"]');
  await expect(cards).toHaveCount(postsNewestFirst.length);
  for (const [index, post] of postsNewestFirst.entries()) {
    await expect(cards.nth(index)).toContainText(post.title);
  }
});

test('the blog index lists Tags alphabetically', async ({ page }) => {
  await page.goto('/blog/');
  const tagPills = page.locator('main a[href^="/blog/tags/"]');
  // Insertion order would be shared-then-alpha (Beta is the newer post): the
  // sorted order must win, or the tag strip reshuffles every time a Post
  // publishes.
  await expect(tagPills).toHaveText([...sortedTags]);
});

test('a Post page renders its frontmatter calendar date', async ({ page }) => {
  await page.goto(posts.alpha.path);
  // 2026-01-05 parses as UTC midnight, and the fixture build runs at
  // TZ=Etc/GMT+12 (harness.ts): an unpinned formatDate renders Jan 4 there,
  // so this passing proves the UTC pin, not just the happy path.
  await expect(page.locator('article time').first()).toHaveText('Jan 5, 2026');
});

test('the projects index renders Featured → Priority → date order', async ({ page }) => {
  await page.goto('/projects/');
  const cards = page.locator('main a[href*="/projects/"]');
  await expect(cards).toHaveCount(projectsInOrder.length);
  for (const [index, project] of projectsInOrder.entries()) {
    await expect(cards.nth(index)).toContainText(project.title);
  }
});

test('the landing page shows Featured cards only, plus the contact links', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: projects.flagship.title })).toBeVisible();
  // Exactly one project card: the sole Featured fixture. Non-Featured
  // projects (pinned, recent, older) must not surface on the landing page.
  await expect(page.locator('main a[href^="/projects/"]')).toHaveCount(1);

  await expect(page.locator('a[href="mailto:markdsouza434@gmail.com"]').first()).toBeVisible();
  await expect(page.locator('a[href="/resume.pdf"]').first()).toBeVisible();
  await expect(
    page.locator('a[href="https://github.com/Mark-DSouza"]').first()
  ).toBeVisible();
  await expect(
    page.locator('a[href="https://www.linkedin.com/in/mark-philip-dsouza/"]').first()
  ).toBeVisible();
});

test('a Tag page lists only the Posts carrying that Tag', async ({ page }) => {
  await page.goto(tagPath(tags.alpha));
  await expect(page.getByRole('link', { name: posts.alpha.title })).toBeVisible();
  // Beta doesn't carry fixture-alpha-tag: a tag page leaking other posts must fail.
  await expect(page.locator(`a[href*="/blog/${posts.beta.slug}"]`)).toHaveCount(0);
});

test('every Post page carries its body', async ({ page }) => {
  for (const post of Object.values(posts)) {
    await page.goto(post.path);
    await expect(page.locator('body')).toContainText(post.sentinel);
  }
});

test('every Case study carries its body and repo link', async ({ page }) => {
  for (const project of projectsInOrder) {
    await page.goto(project.path);
    await expect(page.locator('body')).toContainText(project.sentinel);
    await expect(page.getByRole('link', { name: 'View code →' })).toHaveAttribute(
      'href',
      project.repoUrl
    );
  }
});

test('a Case study shows its repo link, Demo link, and an honest status badge', async ({
  page,
}) => {
  // Flagship has a Demo and is in progress: both must show.
  await page.goto(projects.flagship.path);
  await expect(page.getByRole('link', { name: 'View code →' })).toHaveAttribute(
    'href',
    projects.flagship.repoUrl
  );
  await expect(page.getByRole('link', { name: 'Live demo →' })).toHaveAttribute(
    'href',
    projects.flagship.demoUrl
  );
  await expect(page.locator('main')).toContainText('in progress');

  // Pinned has no Demo and shipped: no Demo link, no in-progress badge.
  await page.goto(projects.pinned.path);
  await expect(page.getByRole('link', { name: 'View code →' })).toHaveAttribute(
    'href',
    projects.pinned.repoUrl
  );
  await expect(page.getByRole('link', { name: 'Live demo →' })).toHaveCount(0);
  await expect(page.locator('main')).toContainText('shipped');
  await expect(page.locator('main')).not.toContainText('in progress');
});
