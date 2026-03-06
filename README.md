# Personal Academic Website

An Astro + Tailwind personal website for academic portfolio content:

- Home and profile sidebar
- CV, Research, Projects, Publications pages
- Markdown blog with dynamic post routes
- SEO metadata + sitemap + robots + favicon
- GitHub Pages deployment via GitHub Actions

## Local Development

```bash
npm install
npm run dev
```

The site runs at `http://localhost:4321`.

## Build and Preview

```bash
npm run build
npm run preview
```

## Phase Progress Checks

To track implementation status phase-by-phase, run:

```bash
npm run check:phase
```

This checks all assigned phases:

- `phase3-projects`
- `phase3-blog`
- `phase4-responsive`
- `phase4-seo`
- `phase4-deploy`
- `phase4-content`

Run a single phase check:

```bash
npm run check:phase:projects
npm run check:phase:blog
npm run check:phase:responsive
npm run check:phase:seo
npm run check:phase:deploy
npm run check:phase:content
```

These commands print PASS/FAIL results and list missing pieces if any check fails.

## Deployment

Deployment is automated by `.github/workflows/deploy.yml`.

On push to `main`:

1. Install dependencies with `npm ci`
2. Build with `npm run build`
3. Upload `dist/` artifact
4. Deploy to GitHub Pages
