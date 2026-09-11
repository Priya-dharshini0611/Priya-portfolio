import { defineConfig } from 'vite';

export default defineConfig({
  // '/' is correct for Vercel (and most hosts at domain root)
  base: '/',
  publicDir: 'public',
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
});
