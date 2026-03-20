/// <reference types="vitest" />
import { defineConfig } from 'vite';

/**
 * Vitest config for RLS tests.
 * No jsdom, no global setup (those are for component tests).
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/test/rls/**/*.test.ts'],
    fileParallelism: false,
  },
});
