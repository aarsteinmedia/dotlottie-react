import { IS_SERVER } from '@aarsteinmedia/lottie-web/utils'

const hoverQuery = IS_SERVER ? null : matchMedia('(any-hover: hover)')

// Keep this dynamic (as opposed to hoverQuery) since users at least in theory can change settings mid session
export const reducedMotionQuery = IS_SERVER ? null : matchMedia('(prefers-reduced-motion: reduce)'),
  HAS_IO_SUPPORT = !IS_SERVER && 'IntersectionObserver' in window,
  HAS_VT_SUPPORT = !IS_SERVER && 'ViewTimeline' in window,
  HAS_HOVER = hoverQuery?.matches