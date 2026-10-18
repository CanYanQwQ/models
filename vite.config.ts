import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Static build. Deployed on its own (Vercel root directory = `plaza/`) and
// loaded either directly or inside the Sub2API custom-page iframe, so asset
// URLs stay root-absolute and no server-side rewrite is required.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'es2020',
  },
})
