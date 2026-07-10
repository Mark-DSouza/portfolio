/** The frontmatter keys that decide a Project's rank: Featured → Priority (desc) → date (desc). */
export interface ProjectOrdering {
  featured: boolean;
  priority: number;
  date: Date;
}

export function compareProjects(a: ProjectOrdering, b: ProjectOrdering): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  if (a.priority !== b.priority) return b.priority - a.priority;
  return b.date.getTime() - a.date.getTime();
}
