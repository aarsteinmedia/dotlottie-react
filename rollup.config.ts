import type { Plugin, RollupOptions } from 'rollup'

import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import autoprefixer from 'autoprefixer'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import flexbugs from 'postcss-flexbugs-fixes'
import { dts } from 'rollup-plugin-dts'
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-opener'
import postcss from 'rollup-plugin-postcss'
import pluginSummary from 'rollup-plugin-summary'
import { swc } from 'rollup-plugin-swc3'
import { typescriptPaths } from 'rollup-plugin-typescript-paths'

const isProd = process.env.NODE_ENV !== 'development',
  __dirname = path.dirname(fileURLToPath(import.meta.url)),

  pkgBuffer = await readFile(new URL(path.resolve(__dirname, 'package.json'), import.meta.url)),
  pkg: typeof import('./package.json') = JSON.parse(pkgBuffer.toString()),

  external = [
    '@aarsteinmedia/lottie-web',
    '@aarsteinmedia/lottie-web/utils',
    'fflate',
    'react',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
  ],

  input = isProd ? path.resolve(
    __dirname, 'src', 'index.tsx'
  ) : path.resolve(
    __dirname, 'preview', 'app.tsx'
  ),

  plugins = (preferBuiltins = false): Plugin[] => [
    typescriptPaths(),
    postcss({
      inject: false,
      plugins: isProd
        ? [
          flexbugs(), autoprefixer({ flexbox: 'no-2009' }),
        ]
        : [],
    }),
    json({ compact: true }),
    nodeResolve({
      extensions: ['.ts'],
      preferBuiltins,
    }),
    commonjs(),
    swc(),
  ],

  modulePlugins = (): Plugin[] =>

    isProd ? [
      ...plugins(true), pluginSummary()
    ] : [
      ...plugins(true),
      serve({
        browser: 'firefox',
        open: true
      }),
      livereload(),
    ],

  types: RollupOptions = {
    external,
    input: path.resolve(
      __dirname, 'types', 'index.d.ts'
    ),
    output: {
      file: pkg.types,
      format: 'esm',
    },
    plugins: [dts()],
  },

  module: RollupOptions = {
    external,
    input,
    onwarn(warning, warn) {
      if (
        warning.code === 'CIRCULAR_DEPENDENCY'
      ) {
        return
      }
      warn(warning)
    },
    output: {
      exports: 'named',
      file: pkg.main,
      format: 'esm',
    },
    plugins: modulePlugins(),
  }

export default isProd ? [
  module, types,
] : module
