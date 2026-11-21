// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// SITE_URL: the public address once deployed (used for sitemap, canonical and Open Graph links).
// BASE_PATH: set to '/<repo-name>' when hosting on GitHub Pages as a project site; '/' otherwise.
const BASE = (process.env.BASE_PATH || '/').replace(/\/$/, '');

/** Prefix root-relative links in Markdown/MDX with the base path (for GitHub Pages project sites). */
function rehypeBaseLinks() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'a' && typeof node.properties?.href === 'string') {
        const h = node.properties.href;
        if (BASE && h.startsWith('/') && !h.startsWith('//') && !h.startsWith(BASE + '/')) node.properties.href = BASE + h;
      }
      (node.children || []).forEach(walk);
    };
    walk(tree);
  };
}

export default defineConfig({
  site: process.env.SITE_URL || 'https://netsilcon.example',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  build: { assets: 'assets' },
  integrations: [mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, rehypeBaseLinks],
    shikiConfig: { theme: 'github-dark-dimmed' },
  },
});
