import type { APIRoute } from 'astro';

// Search engines and AI search assistants are all welcome to crawl the whole site.
// Note: crawlers read robots.txt only at the root of a host. On a GitHub Pages
// project site this file is served under /NetSilcon/, so it documents intent;
// with no root robots.txt, crawlers already treat the whole site as allowed.
const bots = [
  'Googlebot', 'Googlebot-Image', 'Bingbot', 'DuckDuckBot', 'Applebot', 'YandexBot', 'Baiduspider',
  'Google-Extended', 'OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot',
];

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const groups = bots.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n');
  const body = `# NetSilcon: open-source neural network on FPGA\n# All crawlers may index every page.\n\n${groups}\n\nUser-agent: *\nAllow: /\n\nSitemap: ${new URL(`${base}/sitemap-index.xml`, site)}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
