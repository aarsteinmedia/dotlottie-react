import react from '@vitejs/plugin-react-swc'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import preserveDirectives from 'rollup-preserve-directives'
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
        __dirname, 'lib', 'full.tsx'
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
      ],
      input: [
        resolve(
          __dirname, 'lib', 'full.tsx'
        ), resolve(
          __dirname, 'lib', 'light.tsx'
        )
      ],
      output: { preserveModules: false }
    },
    target: 'ES2023'
  },
  plugins: [
    react(),
    preserveDirectives(),
    libInjectCss(),
    dts({
      include: ['lib'],
      rollupTypes: true,
      tsconfigPath: './tsconfig.app.json'
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'lib'),
      '@src': resolve(__dirname, 'src')
    }
  },
})
