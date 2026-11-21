import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/docs' }),
  schema: z.object({ title: z.string(), description: z.string(), order: z.number() }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/news' }),
  schema: z.object({ title: z.string(), description: z.string(), date: z.coerce.date() }),
});

export const collections = { docs, news };
