import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/local/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    fileParallelism: false,
  },
});
