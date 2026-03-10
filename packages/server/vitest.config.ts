import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Provide minimal Firebase credentials so config.ts passes validation in
    // all test files without requiring individual stubEnv calls.
    env: {
      FIREBASE_SERVICE_ACCOUNT_JSON: '{}',
    },
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
    },
  },
});
