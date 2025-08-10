import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@fjell/http-api': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: 'coverage',
      all: true,
      include: ['src/**/*.ts', 'examples/**/*.ts'],
      thresholds: {
        branches: 80,
        functions: 90,
        lines: 91,
        statements: 91,
      },
      checkCoverage: true,
    },
    setupFiles: ['vitest.setup.ts'],
    globals: true,
  },
});
