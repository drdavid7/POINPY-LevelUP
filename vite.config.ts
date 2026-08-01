import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      external: ['@capacitor-community/admob'],
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
});
