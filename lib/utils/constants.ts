import { isServer } from '@aarsteinmedia/lottie-web/utils'

export const hasReducedMotion = !isServer && matchMedia('(prefers-reduced-motion: reduce)').matches