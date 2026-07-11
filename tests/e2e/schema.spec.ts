import { expect, test } from '@playwright/test';
import { buildFixtureSite } from './harness';

// Build-time schema guards: no browser, no server — these spawn real builds
// against purpose-built failing fixtures and assert the build refuses them.

// The Draft concept is retired (ADR-0001): git branches are the draft
// mechanism. A leftover `draft:` key must fail the build loudly so a post
// the author believed hidden can never silently publish.
test('a stray draft: key fails the build with a retirement error', () => {
  test.slow();
  expect(() =>
    buildFixtureSite('draft-key', { contentDir: './tests/fixtures/draft-key-content' })
  ).toThrow(/draft.*retired[\s\S]*unmerged branch/i);
});

// Schemas are .strict(): a misspelled key fails the build instead of being
// silently stripped (a typo'd `tags:` would otherwise just lose the tags).
test('an unrecognized frontmatter key fails the build', () => {
  test.slow();
  expect(() =>
    buildFixtureSite('typo-key', { contentDir: './tests/fixtures/typo-key-content' })
  ).toThrow(/unrecognized key/i);
});
