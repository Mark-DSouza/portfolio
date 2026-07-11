import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Tests point the build at fixture content via CONTENT_DIR (owned by tests/e2e/harness.ts); real builds use src/content. */
const contentRoot = process.env.CONTENT_DIR ?? './src/content';

/** Tags are lowercase-kebab so casing variants can never fork into duplicate tag pages. */
const tag = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
  message: 'Tags must be lowercase-kebab (e.g. "spring-boot")',
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: `${contentRoot}/blog` }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        tags: z.array(tag).default([]),
        // The Draft concept is retired (ADR-0001). Declared as always-failing —
        // rather than left to .strict()'s generic unrecognized-key error — so a
        // post the author believed hidden fails with an explanation instead of
        // silently publishing.
        draft: z
          .custom<never>(() => false, {
            message:
              'The `draft` flag was retired (ADR-0001): a Post is published by merging to main — keep WIP on an unmerged branch and delete this key.',
          })
          .optional(),
        updatedDate: z.coerce.date().optional(),
        cover: image().optional(),
      })
      .strict(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: `${contentRoot}/projects` }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        tags: z.array(tag).default([]),
        status: z.enum(['in-progress', 'shipped']),
        featured: z.boolean().default(false),
        priority: z.number().int().default(0),
        repoUrl: z.string().url(),
        demoUrl: z.string().url().optional(),
        cover: image().optional(),
      })
      .strict(),
});

export const collections = { blog, projects };
