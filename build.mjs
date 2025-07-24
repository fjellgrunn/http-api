#!/usr/bin/env node

import { build } from 'esbuild';
import { execSync } from 'child_process';
import fs from 'fs';

// Clean dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.mkdirSync('dist', { recursive: true });

// Build ESM version
await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  format: 'esm',
  target: 'es2022',
  platform: 'node',
  external: ['@fjell/logging'],
  sourcemap: true,
  minify: false,
  banner: {
    js: `// ESM build for @fjell/http-api`,
  },
});

// Generate TypeScript declarations
console.log('Generating TypeScript declarations...');
try {
  execSync('pnpm exec tsc --emitDeclarationOnly --outDir dist --declarationDir dist', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Error generating TypeScript declarations:', error.message);
  process.exit(1);
}
