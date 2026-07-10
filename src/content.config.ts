import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Tests point the build at fixture content via CONTENT_DIR; real builds use src/content. */
const contentRoot = process.env.CONTENT_DIR ?? './src/content';

/** Tags are lowercase-kebab so casing variants can never fork into duplicate tag pages. */
const tag = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
  message: 'Tags must be lowercase-kebab (e.g. "spring-boot")',
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: `${contentRoot}/blog` }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      tags: z.array(tag).default([]),
      draft: z.boolean().default(false),
      updatedDate: z.coerce.date().optional(),
      cover: image().optional(),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: `${contentRoot}/projects` }),
  schema: ({ image }) =>
    z.object({
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
    }),
});

export const collections = { blog, projects };
