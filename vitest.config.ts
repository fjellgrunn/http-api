import { defineConfig } from 'vitest/config';

export default defineConfig({
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
