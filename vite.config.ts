import react from '@vitejs/plugin-react'
import autoprefixer from 'autoprefixer'
import {
  readFile, rm, writeFile
} from 'node:fs/promises'
import {
  dirname, join, resolve
} from 'node:path'
import { fileURLToPath } from 'node:url'
import flexbugsFixes from 'postcss-flexbugs-fixes'
import preserveDirectives from 'rollup-preserve-directives'
import { defineConfig, type Plugin } from 'vite'
import dts from 'vite-plugin-dts'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * CSS Modules are compiled at build time (hashed class names in JS + CSS).
 * Vite emits one combined CSS file; rename it to styles.css and wire it into the entries.
 */
function compiledCssModules(): Plugin {
  let outDir = 'dist'

  return {
    async closeBundle() {
      const distDir = resolve(__dirname, outDir),
        bundledCss = join(distDir, 'dotlottie-react.css'),
        stylesPath = join(distDir, 'styles.css')

      let css: string

      try {
        css = await readFile(bundledCss, 'utf8')
      } catch {
        return
      }

      await writeFile(stylesPath, css)
      await rm(bundledCss)

      for (const entry of ['full.js', 'light.js']) {
        const entryPath = join(distDir, entry),
          source = await readFile(entryPath, 'utf8')

        if (!source.includes('./styles.css')) {
          await writeFile(entryPath, `import "./styles.css";\n${source}`)
        }
      }
    },
    configResolved(config) {
      outDir = config.build.outDir
    },
    name: 'compiled-css-modules',
  }
}

// https://vite.dev/config/
export default defineConfig({
  build: {
    copyPublicDir: false,
    cssTarget: 'es2022',
    lib: {
      entry: {
        full: resolve(
          __dirname, 'lib', 'full.tsx'
        ),
        light: resolve(
          __dirname, 'lib', 'light.tsx'
        )
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        '@aarsteinmedia/lottie-web',
        '@aarsteinmedia/lottie-web/light',
        '@aarsteinmedia/lottie-web/utils',
        '@aarsteinmedia/lottie-web/dotlottie',
        'react',
        'react/jsx-runtime'
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'lib'
      }
    },
    target: 'es2023'
  },
  css: {
    // modules: { scopeBehaviour: 'local' },
    postcss: {
      plugins: [
        autoprefixer({ flexbox: 'no-2009' }), flexbugsFixes(),
      ]
    },
  },
  plugins: [
    react(),
    preserveDirectives(),
    compiledCssModules(),
    dts({
      compilerOptions: { rootDir: 'lib' },
      entryRoot: 'lib',
      include: ['lib'],
      tsconfigPath: './tsconfig.build.json'
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'lib'),
      '@src': resolve(__dirname, 'src')
    }
  },
})
