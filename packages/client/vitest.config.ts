import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // cast needed: vitest bundles its own vite internally, causing a Plugin type
  // mismatch between the project's vite and vitest's internal copy at runtime.
  plugins: [react() as any],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
    },
  },
});
