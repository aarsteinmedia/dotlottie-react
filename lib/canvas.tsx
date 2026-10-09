'use client'
import { loadAnimation } from '@aarsteinmedia/lottie-web/canvas'
import { RendererType } from '@aarsteinmedia/lottie-web/utils'

import type { DotLottieMethods, DotLottieProps } from '@/types'

import { createDotLottiePlayer } from '@/utils/createDotLottiePlayer'

export type { DotLottieMethods, DotLottieProps }

let hasWarnedRenderer = false

export default function DotLottiePlayer({ renderer, ...props }: React.HTMLAttributes<HTMLElement> & DotLottieProps) {
  // The canvas build only registers the Canvas renderer
  if (
    process.env.NODE_ENV !== 'production' &&
    renderer &&
    renderer !== RendererType.Canvas &&
    !hasWarnedRenderer
  ) {
    hasWarnedRenderer = true
    console.warn(`[dotlottie-react] renderer "${renderer}" is not available in ` +
      '@aarsteinmedia/dotlottie-react/canvas, falling back to "canvas". Import from ' +
      '@aarsteinmedia/dotlottie-react to use other renderers.')
  }

  return createDotLottiePlayer(loadAnimation, {
    ...props,
    renderer: RendererType.Canvas
  })
}
