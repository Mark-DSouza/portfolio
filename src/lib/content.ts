import { getCollection, type CollectionEntry } from 'astro:content';
import { compareProjects } from './ordering';

/**
 * Every Post in the build is published: git is the draft mechanism (ADR-0001),
 * so an unmerged branch is the only place work-in-progress lives.
 */
export async function getPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog');
  return posts.toSorted((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Unique tags across Posts — each of these gets a tag page. */
export async function getTags(): Promise<string[]> {
  const posts = await getPosts();
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
