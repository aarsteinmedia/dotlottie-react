import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'lib'),
      '@src': resolve(__dirname, 'src'),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          environment: 'jsdom',
          exclude: ['lib/**/*.ssr.{test,spec}.{ts,tsx}'],
          globals: false,
          include: ['lib/**/*.{test,spec}.{ts,tsx}'],
          name: 'unit',
          setupFiles: [resolve(__dirname, 'vitest.setup.ts')],
        }
      }, {
        extends: true,
        test: {
          environment: 'node',
          include: ['lib/**/*.ssr.{test,spec}.{ts,tsx}'],
          name: 'ssr'
        }
      }
    ]
  },
})
