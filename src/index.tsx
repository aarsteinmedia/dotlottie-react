import type { AnimationDirection } from '@aarsteinmedia/lottie-web'

import { PlayMode, RendererType } from '@aarsteinmedia/lottie-web/utils'

import Player from '@/components/Player'

import AppProvider from './context/AppProvider'

export { PlayerState } from '@/utils/enums'
export { PlayerEvents } from '@aarsteinmedia/lottie-web/utils'

export default function DotLottiePlayer({
  animateOnScroll,
  autoplay,
  background,
  controls,
  count = 0,
  description,
  direction = 1,
  hover,
  id,
  intermission,
  loop,
  mode = PlayMode.Normal,
  objectFit = 'contain',
  renderer = RendererType.SVG,
  simple,
  speed = 1,
  src,
  subframe
}: {
  animateOnScroll?: boolean
  autoplay?: boolean
  background?: string
  controls?: boolean
  count?: number
  description?: string
  direction?: AnimationDirection,
  hover?: boolean
  id?: string
  intermission?: number
  loop?: boolean
  mode?: PlayMode,
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  renderer?: RendererType
  simple?: boolean
  speed?: number,
  src: string
  subframe?: boolean
}) {
  return (
    <AppProvider
      animateOnScroll={animateOnScroll}
      autoplay={autoplay}
      controls={controls}
      id={id}
      simple={simple}
      src={src}
    >
      <Player
        background={background}
        count={count}
        objectFit={objectFit}
      />
    </AppProvider>
  )
}