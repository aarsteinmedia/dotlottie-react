import type { AnimationDirection } from '@aarsteinmedia/lottie-web'

import { PlayMode, RendererType } from '@aarsteinmedia/lottie-web/utils'

import type { DotLottieMethods } from '@/types'

import Player from '@/components/Player'
import AppProvider from '@/context/AppProvider'

export type { DotLottieMethods }
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
  ref,
  renderer = RendererType.SVG,
  simple,
  speed = 1,
  src,
  subframe,
  ...rest
}: React.HTMLAttributes<HTMLElement> & {
  animateOnScroll?: boolean
  autoplay?: boolean
  background?: string
  controls?: boolean
  count?: number
  description?: string
  direction?: AnimationDirection
  hover?: boolean
  id?: string
  intermission?: number
  loop?: boolean
  mode?: 'normal' | 'bounce',
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  renderer?: RendererType
  simple?: boolean
  speed?: number
  src: string
  ref?: React.RefObject<DotLottieMethods | null>
  subframe?: boolean
}) {

  return (
    <AppProvider
      animateOnScroll={animateOnScroll}
      autoplay={autoplay}
      controls={controls}
      id={id}
      loop={loop}
      mode={mode as PlayMode}
      simple={simple}
      src={src}
    >
      <Player
        background={background}
        count={count}
        description={description}
        direction={direction}
        hover={hover}
        intermission={intermission}
        objectFit={objectFit}
        renderer={renderer}
        speed={speed}
        subframe={subframe}
        ref={ref}
        {...rest}
      />
    </AppProvider>
  )
}