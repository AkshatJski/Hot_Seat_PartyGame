import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * `base` is env-driven so ONE build works on a root domain (Vercel, Cloudflare
 * Pages, Netlify) and on a project subpath (GitHub Pages serves
 * `/Repo-Name/`) without a code change.
 *
 * Leave it unset for root hosting. Set BASE_PATH=/Repo-Name/ only for subpath
 * hosting — getting this wrong makes every asset 404 and the page render blank.
 *
 * Note this app has no URL router (the phase switch is component state, not a
 * path), so no SPA 404-fallback rewrite is needed on any host.
 */
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  build: {
    // Room for the generous sourcemap-free error messages of a party app:
    // readable chunks mean a stale cached chunk fails loudly instead of silently.
    chunkSizeWarningLimit: 700,
  },
})