'use client'
import { loadAnimation } from '@aarsteinmedia/lottie-web/light'

import type { DotLottieMethods, DotLottieProps } from '@/types'

import { createDotLottiePlayer } from '@/utils/createDotLottiePlayer'

export type { DotLottieMethods, DotLottieProps }

export default function DotLottiePlayer(props: React.HTMLAttributes<HTMLElement> & DotLottieProps) {
  return createDotLottiePlayer(loadAnimation, props)
}