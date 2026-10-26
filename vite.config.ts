import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  // Relative asset paths so the build works on GitHub Pages project sites
  // (https://<user>.github.io/goods-sort/) as well as locally.
  base: "./",
  plugins: [preact()],
  server: {
    port: 4200,
  },
  build: {
    outDir: "dist",
  },
});
