import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/color/**'],
      thresholds: { lines: 80, functions: 80, branches: 80 },
    },
  },
  resolve: { alias: { '@': resolve(__dirname, '.') } },
})
