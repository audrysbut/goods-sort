import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  server: {
    port: 4200,
  },
  build: {
    outDir: 'dist',
  },
});