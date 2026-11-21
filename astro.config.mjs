// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// SITE_URL: the public address once deployed (used for sitemap, canonical and Open Graph links).
// BASE_PATH: set to '/<repo-name>' when hosting on GitHub Pages as a project site; '/' otherwise.
export default defineConfig({
  site: process.env.SITE_URL || 'https://netsilcon.example',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: { theme: 'github-dark-dimmed' },
  },
});
