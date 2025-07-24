import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@examples': path.resolve(__dirname, './examples'),
      '@fjell/http-api': path.resolve(__dirname, './src/index.ts'),
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
      include: ['src/**/*.ts'],
      thresholds: {
        global: {
          branches: 66,
          functions: 71,
          lines: 75,
          statements: 75,
        },
      },
    },
    setupFiles: ['vitest.setup.ts'],
    globals: true,
  },
});
