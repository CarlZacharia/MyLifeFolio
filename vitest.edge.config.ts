/// <reference types="vitest" />
import { defineConfig } from 'vite';

/**
 * Vitest config for Edge Function integration tests.
 * Node environment, no jsdom, no global setup, sequential execution.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/test/edge/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 45_000,
  },
});
