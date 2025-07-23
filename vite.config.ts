import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/index.ts',
      exportName: 'viteNodeApp',
      tsCompiler: 'swc',
      swcOptions: {
        sourceMaps: true,
      },
    }),
    // visualizer({
    //     template: 'network',
    //     filename: 'network.html',
    //     projectRoot: process.cwd(),
    // }),
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      exclude: ['./tests/**/*.ts'],
      include: ['./src/**/*.ts'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@examples': path.resolve(__dirname, './examples'),
      '@fjell/http-api': path.resolve(__dirname, './src/index.ts'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    lib: {
      entry: './src/index.ts',
      fileName: (format) => format === 'cjs' ? 'index.cjs' : 'index.js',
    },
    rollupOptions: {
      input: 'src/index.ts',
      // Externalize dependencies so they're not bundled
      external: [
        // All dependencies from package.json
        '@fjell/logging',
        // Node.js built-in modules
        'fs',
        'path',
        'url',
        'util',
        'events',
        'stream',
        'buffer',
        'querystring',
        'http',
        'https',
        'net',
        'crypto',
        'zlib',
        'os',
        'assert',
        'child_process',
        'cluster',
        'dgram',
        'dns',
        'domain',
        'module',
        'perf_hooks',
        'process',
        'punycode',
        'readline',
        'repl',
        'string_decoder',
        'sys',
        'timers',
        'tls',
        'tty',
        'v8',
        'vm',
        'worker_threads',
        // Node.js built-in modules with node: prefix
        /^node:/,
      ],
      output: [
        {
          format: 'esm',
          entryFileNames: '[name].js',
          preserveModules: true,
          exports: 'named',
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          preserveModules: true,
          exports: 'named',
        },
      ],
    },
    // Make sure Vite generates ESM-compatible code
    modulePreload: false,
    minify: false,
    sourcemap: true
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
