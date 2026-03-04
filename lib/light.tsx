import type { AnimationDirection } from '@aarsteinmedia/lottie-web'

import { PlayMode, RendererType } from '@aarsteinmedia/lottie-web/utils'

import type { DotLottieMethods } from '@/types'

import PlayerLight from '@/components/PlayerLight'
import AppProvider from '@/context/AppProvider'
import { ObjectFit } from '@/utils/enums'

export type { DotLottieMethods }
export { ObjectFit, PlayerState } from '@/utils/enums'
export { PlayerEvents } from '@aarsteinmedia/lottie-web/utils'
export { PlayMode }

interface InlineInterface {
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
  mode?: PlayMode,
  objectFit?: ObjectFit
  ref?: React.RefObject<DotLottieMethods | null>
  renderer?: RendererType
  simple?: boolean
  speed?: number
  src: string
  subframe?: boolean
}
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
  objectFit = ObjectFit.Contain,
  ref,
  renderer = RendererType.SVG,
  simple,
  speed = 1,
  src,
  subframe,
  ...rest
}: React.HTMLAttributes<HTMLElement> & InlineInterface) {

  return (
    <AppProvider
      animateOnScroll={animateOnScroll}
      autoplay={autoplay}
      controls={controls}
      id={id}
      loop={loop}
      mode={mode}
      simple={simple}
      src={src}
    >
      <PlayerLight
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