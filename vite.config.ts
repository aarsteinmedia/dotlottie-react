import react from '@vitejs/plugin-react-swc'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(
        __dirname, 'lib', 'index.tsx'
      ),
      formats: ['es']
    },
    target: 'ES2023'
  },
  plugins: [react()],
  resolve: { alias: { '@': resolve(__dirname, 'lib') } },
})
