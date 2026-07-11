/**
 * Fixture facts: the literals the e2e specs assert against, transcribed BY
 * HAND from the markdown in ./content. Never derive these from the files —
 * a fact read out of the fixtures would assert the build against itself and
 * the suite goes tautological. Only multi-consumer literals live here; a
 * value one test uses stays inline in its spec, where reading it beats
 * indirection.
 */

export const posts = {
  alpha: {
    slug: 'published-alpha',
    path: '/blog/published-alpha/',
    title: 'Fixture Alpha',
    sentinel: 'fixture-alpha-body',
  },
  beta: {
    slug: 'published-beta',
    path: '/blog/published-beta/',
    title: 'Fixture Beta',
    sentinel: 'fixture-beta-body',
  },
} as const;

/** Newest first: Beta (2026-02-10) precedes Alpha (2026-01-05). */
export const postsNewestFirst = [posts.beta, posts.alpha] as const;

export const projects = {
  flagship: {
    path: '/projects/flagship/',
    title: 'Fixture Flagship',
    sentinel: 'fixture-flagship-body',
    repoUrl: 'https://github.com/example/flagship',
    demoUrl: 'https://flagship.example.com',
  },
  pinned: {
    path: '/projects/pinned/',
    title: 'Fixture Pinned',
    sentinel: 'fixture-pinned-body',
    repoUrl: 'https://github.com/example/pinned',
  },
  recent: {
    path: '/projects/recent/',
    title: 'Fixture Recent',
    sentinel: 'fixture-recent-body',
    repoUrl: 'https://github.com/example/recent',
  },
  older: {
    path: '/projects/older/',
    title: 'Fixture Older',
    sentinel: 'fixture-older-body',
    repoUrl: 'https://github.com/example/older',
  },
} as const;

/** Featured → Priority → date: flagship (featured) → pinned (priority 5) → recent (2025) → older (2024). */
export const projectsInOrder = [
  projects.flagship,
  projects.pinned,
  projects.recent,
  projects.older,
] as const;

export const tags = {
  alpha: 'fixture-alpha-tag',
  shared: 'fixture-shared-tag',
} as const;

/** Alphabetical — the order the blog index must render the tag strip in. */
export const sortedTags = [tags.alpha, tags.shared] as const;

export const tagPath = (tag: string) => `/blog/tags/${tag}/`;

/** Every page the fixture site publishes; the crawl asserts exactly this set. */
export const allPages = [
  '/',
  '/blog/',
  '/projects/',
  ...Object.values(posts).map((post) => post.path),
  ...Object.values(projects).map((project) => project.path),
  ...Object.values(tags).map(tagPath),
];
