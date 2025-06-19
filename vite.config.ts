import react from '@vitejs/plugin-react-swc'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

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
    rollupOptions: {
      external: [
        '@aarsteinmedia/lottie-web',
        '@aarsteinmedia/lottie-web/utils',
        'fflate',
        'react',
        'react/jsx-runtime'
      ]
    },
    target: 'ES2023'
  },
  plugins: [
    react(),
    libInjectCss(),
    dts({
      include: ['lib'],
      rollupTypes: true,
      tsconfigPath: './tsconfig.app.json'
    })
  ],
  resolve: { alias: { '@': resolve(__dirname, 'lib') } },
})
