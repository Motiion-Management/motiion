import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ['zod', 'convex', 'convex-helpers'],
  outDir: 'dist',
  target: 'node18',
  esbuildOptions(options) {
    options.banner = {
      js: '"use strict";'
    }
  }
})