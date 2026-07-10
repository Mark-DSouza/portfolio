import { getCollection, type CollectionEntry } from 'astro:content';
import { compareProjects } from './ordering';

/**
 * Drafts render in dev and on Cloudflare Pages preview deploys, but are
 * excluded from the production build (the `main` branch deploy).
 */
const onPreviewBranch =
  typeof process !== 'undefined' &&
  process.env.CF_PAGES_BRANCH !== undefined &&
  process.env.CF_PAGES_BRANCH !== 'main';

export const includeDrafts = import.meta.env.DEV || onPreviewBranch;

export async function getPublishedPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => includeDrafts || !data.draft);
  return posts.toSorted((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Unique tags across published posts — each of these gets a tag page. */
export async function getPublishedTags(): Promise<string[]> {
  const posts = await getPublishedPosts();
  return [...new Set(posts.flatMap((post) => post.data.tags))].toSorted();
}

export async function getOrderedProjects(): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects');
  return projects.toSorted((a, b) => compareProjects(a.data, b.data));
}

export function formatDate(date: Date): string {
  // Frontmatter dates parse as UTC midnight; format in UTC so the calendar
  // date never shifts with the build machine's timezone.
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
}

/** Absolute URL for a cover image's social-share card, if the piece has one. */
export function coverOgImage(
  cover: { src: string } | undefined,
  site: URL | undefined
): string | undefined {
  return cover ? new URL(cover.src, site).toString() : undefined;
}
