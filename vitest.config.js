import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./test/setup.ts'],
    restoreMocks: true,
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      all: true,
      include: ['src'],
      exclude: ['src/configurator/**/*', 'src/duckbench.ts'],
      thresholds: {
        functions: 100,
        lines: 100,
        statements: 100,
        branches: 100,
      }
    },
  },
})
