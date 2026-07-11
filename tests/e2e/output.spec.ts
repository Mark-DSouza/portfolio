import { readdirSync } from 'node:fs';
import { XMLValidator } from 'fast-xml-parser';
import { expect, test } from '@playwright/test';
import { fixtureDist } from './harness';

// Feeds and shipped artifacts, asserted where their consumers meet them: an
// RSS reader, a crawler, and a recruiter fetch these over HTTP.

test('the RSS feed is well-formed XML carrying every post', async ({ request }) => {
  const response = await request.get('/rss.xml');
  expect(response.status()).toBe(200);
  const rss = await response.text();
  expect(XMLValidator.validate(rss)).toBe(true);
  expect(rss).toContain('<rss');
  expect(rss).toContain('/blog/published-alpha');
  expect(rss).toContain('/blog/published-beta');
});

test('a well-formed sitemap and a robots.txt are served', async ({ request }) => {
  const sitemap = await request.get('/sitemap-index.xml');
  expect(sitemap.status()).toBe(200);
  expect(XMLValidator.validate(await sitemap.text())).toBe(true);

  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
});

test('the resume link serves an actual PDF', async ({ request }) => {
  const response = await request.get('/resume.pdf');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
});

// Artifact property no browser can see: an emitted-but-unreferenced JS file
// would pass the zero-JS-requests test yet still ship. The e2e server has
// already built the `e2e` variant by the time specs run.
test('the built output ships zero JavaScript files', () => {
  const files = readdirSync(fixtureDist('e2e'), { recursive: true }) as string[];
  expect(files.filter((file) => file.endsWith('.js'))).toEqual([]);
});
