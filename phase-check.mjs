import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const safeJson = (relativePath) => JSON.parse(read(relativePath));

const notPlaceholder = (text) =>
  !/Your Name|Your University|you@example\.com|your-github|your-scholar-id|YOUR_USERNAME/i.test(text);

function runChecks(phaseId) {
  const checks = {
    'phase3-projects': [
      () => exists('src/pages/projects.astro') || 'Missing `src/pages/projects.astro`.',
      () => exists('src/components/ProjectCard.astro') || 'Missing `src/components/ProjectCard.astro`.',
      () => {
        const projects = safeJson('src/data/projects.json');
        return (
          (Array.isArray(projects) && projects.length >= 3) ||
          '`src/data/projects.json` should contain at least 3 projects.'
        );
      },
    ],
    'phase3-blog': [
      () => exists('src/content/config.ts') || 'Missing `src/content/config.ts`.',
      () => exists('src/pages/blog/index.astro') || 'Missing `src/pages/blog/index.astro`.',
      () => exists('src/pages/blog/[...slug].astro') || 'Missing `src/pages/blog/[...slug].astro`.',
      () => exists('src/components/BlogPostCard.astro') || 'Missing `src/components/BlogPostCard.astro`.',
      () => {
        const blogDir = path.join(root, 'src/content/blog');
        if (!fs.existsSync(blogDir)) return 'Missing `src/content/blog` directory.';
        const posts = fs.readdirSync(blogDir).filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));
        return posts.length > 0 || 'No markdown posts found in `src/content/blog`.';
      },
    ],
    'phase4-responsive': [
      () => /mobile-menu-btn/.test(read('src/components/Header.astro')) || 'Mobile menu button not found in header.',
      () => /aria-expanded/.test(read('src/components/Header.astro')) || 'Header should expose `aria-expanded`.',
      () => /sm:flex-row/.test(read('src/components/NewsItem.astro')) || 'News timeline does not include small-screen layout refinement.',
      () => /lg:sticky/.test(read('src/layouts/PageLayout.astro')) || 'Sticky sidebar rule missing in page layout.',
    ],
    'phase4-seo': [
      () => /rel="canonical"/.test(read('src/layouts/BaseLayout.astro')) || 'Canonical tag missing from BaseLayout.',
      () => /og:/.test(read('src/layouts/BaseLayout.astro')) || 'Open Graph tags missing from BaseLayout.',
      () => /twitter:/.test(read('src/layouts/BaseLayout.astro')) || 'Twitter meta tags missing from BaseLayout.',
      () => exists('public/favicon.svg') || 'Missing favicon file.',
      () => exists('public/robots.txt') || 'Missing robots.txt.',
      () => /sitemap/.test(read('astro.config.mjs')) || 'Sitemap integration missing in astro.config.mjs.',
    ],
    'phase4-deploy': [
      () => exists('.github/workflows/deploy.yml') || 'Missing `.github/workflows/deploy.yml`.',
      () => /actions\/deploy-pages@/i.test(read('.github/workflows/deploy.yml')) || 'Deploy Pages action missing in workflow.',
      () => /actions\/upload-pages-artifact@/i.test(read('.github/workflows/deploy.yml')) || 'Upload artifact action missing in workflow.',
      () => /npm run build/.test(read('.github/workflows/deploy.yml')) || 'Build step missing in workflow.',
    ],
    'phase4-content': [
      () => {
        const profile = read('src/data/profile.json');
        return notPlaceholder(profile) || 'Placeholder profile values still exist.';
      },
      () => {
        const dataFiles = [
          'src/data/news.json',
          'src/data/publications.json',
          'src/data/projects.json',
          'src/data/research.json',
          'src/data/education.json',
          'src/data/experience.json',
        ];
        const hasPlaceholder = dataFiles.some((file) => !notPlaceholder(read(file)));
        return !hasPlaceholder || 'One or more data files still contain placeholder values.';
      },
      () => exists('public/images/profile.svg') || 'Profile image asset is missing.',
    ],
  };

  if (!checks[phaseId]) {
    return { phaseId, passed: 0, total: 1, failures: [`Unknown phase id: ${phaseId}`] };
  }

  const failures = [];
  for (const check of checks[phaseId]) {
    const result = check();
    if (result !== true) failures.push(result);
  }

  return {
    phaseId,
    passed: checks[phaseId].length - failures.length,
    total: checks[phaseId].length,
    failures,
  };
}

const knownPhases = [
  'phase3-projects',
  'phase3-blog',
  'phase4-responsive',
  'phase4-seo',
  'phase4-deploy',
  'phase4-content',
];

const targetPhase = process.argv[2];
const targetPhases = targetPhase ? [targetPhase] : knownPhases;
const reports = targetPhases.map((phase) => runChecks(phase));

let totalFailures = 0;
for (const report of reports) {
  const ok = report.failures.length === 0;
  totalFailures += report.failures.length;
  console.log(`\n${ok ? 'PASS' : 'FAIL'} ${report.phaseId} (${report.passed}/${report.total})`);
  if (!ok) {
    for (const failure of report.failures) {
      console.log(`  - ${failure}`);
    }
  }
}

if (totalFailures === 0) {
  console.log('\nAll selected phase checks passed.');
} else {
  console.log(`\n${totalFailures} check(s) failed.`);
  process.exit(1);
}
