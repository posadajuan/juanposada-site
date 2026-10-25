import { defineConfig } from 'vitest/config';

// Unit tests for the Worker (the contact form backend).
// Browser tests live in ./tests and run with Playwright.
export default defineConfig({
  test: {
    include: ['worker/**/*.test.ts'],
    environment: 'node',
  },
});
