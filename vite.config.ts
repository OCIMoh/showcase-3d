import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 4000,
    open: false
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsInlineLimit: 4096
  }
});

