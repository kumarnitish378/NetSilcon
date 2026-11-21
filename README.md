# NetSilcon website

The official website for **NetSilcon**, open-source neural-network hardware: a fixed network shape with loadable weights, biases and shifts.

Built with [Astro](https://astro.build) (static output), MDX for the docs and [Pagefind](https://pagefind.app) for search. No backend, no tracking, no external requests: fonts, KaTeX and every graphic are served from the site itself.

## Run it on your computer

You need [Node.js](https://nodejs.org) 18.20 or newer (20 or 22 recommended).

```bash
npm install          # once
npm run dev          # live preview at http://localhost:4321
```

Search only works after a full build (Pagefind indexes the built pages):

```bash
npm run build        # builds to dist/ and creates the search index
npm run preview      # serves dist/ at http://localhost:4321
```

`npm run check` verifies that the playground's JavaScript copy of the network is bit-exact: it runs all 576 golden vectors of every model in `src/data/models/` and checks each model's CRC-16.

## Before you publish

1. **GitHub link.** Open `src/config.ts` and set `githubUrl` to the real repository address. Every GitHub link on the site comes from this one line.
2. **Contact.** In the same file, fill in `contact.email`, `contact.linkedin` and `contact.github`, or leave a field empty to hide it.
3. **Site address.** Set the `SITE_URL` environment variable to your public address when you build (used for the sitemap, canonical links and the Open Graph image). Example: `SITE_URL=https://netsilcon.dev npm run build`.

## Deploy

The output in `dist/` is plain static files. Any static host works.

### Netlify or Vercel

Import the repository. Build command `npm run build`, output folder `dist`. Add `SITE_URL` as an environment variable.

### GitHub Pages

- **User or organisation site** (`username.github.io`): build normally.
- **Project site** (`username.github.io/netsilcon-website`): build with the repository name as the base path:

  ```bash
  SITE_URL=https://username.github.io BASE_PATH=/netsilcon-website npm run build
  ```

A minimal workflow, saved as `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on: { push: { branches: [main] } }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run build
        env:
          SITE_URL: https://username.github.io
          BASE_PATH: /netsilcon-website
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages }
    steps:
      - uses: actions/deploy-pages@v4
```

Then in the repository: Settings → Pages → Source: **GitHub Actions**.

## Where things are

```
src/config.ts            GitHub URL and contact links (placeholders)
src/data/facts.ts        every number on the site, with its basis: M measured, E estimated, T target
src/data/models/*.json   the real model files from the NetSilcon-6x4 repository
src/scripts/netsilcon.js bit-exact JavaScript port of the int8 network (playground)
src/components/          hand-built SVG: network, timing diagram, pinout, block diagram, icons
src/pages/               one file per page
src/content/docs/*.mdx   documentation (sidebar order = `order` in the front matter)
src/content/news/*.mdx   news posts
src/styles/global.css    design tokens, light and dark theme
public/files/            datasheet PDF
public/media/            videos and their poster frames
public/sim/              the browser rover simulator from the repository (fonts made local)
public/og.png, og.svg    Open Graph image
scripts/verify-models.mjs  bit-exact check for the model port
```

### Adding a doc page

Create `src/content/docs/my-page.mdx`:

```mdx
---
title: "My page"
description: "One sentence shown under the title and in search results."
order: 7
---

Content in Markdown. Maths works too: $y = w \cdot x + b$
```

### Adding a news post

Create `src/content/news/my-post.mdx` with `title`, `description` and `date` (YYYY-MM-DD). Posts are listed newest first.

### Updating a number

Change it in `src/data/facts.ts` (tables, specs, roadmap, applications) and keep its basis label honest: **M** only for values measured on the FPGA reference, **E** for tool or datasheet estimates, **T** for production targets.

## Design notes

- Direction: a printed datasheet. Visible grid, hairline rules, mono numbers, schematic-style callouts.
- Palette from the keynote deck: ink `#0B1220`, ink-2 `#121C30`, paper `#F2F5F9`, teal `#00706A` on light and `#2DD4BF` on dark. Amber marks planned and target items only.
- Type: Space Grotesk (headings), IBM Plex Sans (body), IBM Plex Mono (numbers and code), self-hosted.
- Styling is plain CSS with custom properties rather than Tailwind: the palette, two themes and the hand-built SVGs share one small set of tokens, and the output stays small with no styling build step.
- Motion is CSS/SVG only and switches off under `prefers-reduced-motion`.

## Licence

Apache License 2.0. See [LICENSE](LICENSE). Copyright 2026 Nitish Kumar Sharma.
