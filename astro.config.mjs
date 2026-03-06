// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const repository = process.env.GITHUB_REPOSITORY || '';
const [owner = 'YOUR_USERNAME', repo = ''] = repository.split('/');
const isUserSite = repo.toLowerCase() === `${owner.toLowerCase()}.github.io`;
const defaultSite = `https://${owner}.github.io`;
const defaultBase = repo && !isUserSite ? `/${repo}` : '/';

export default defineConfig({
  site: process.env.SITE_URL || defaultSite,
  base: process.env.SITE_BASE || defaultBase,
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
