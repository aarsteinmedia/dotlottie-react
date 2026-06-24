import type { AnimationConfiguration, AnimationItem } from '@aarsteinmedia/lottie-web'

import { PlayMode, RendererType } from '@aarsteinmedia/lottie-web/utils'

import type { DotLottieProps } from '@/types'

import Player from '@/components/Player'
import AppProvider from '@/context/AppProvider'
import { ObjectFit } from '@/utils/enums'

export function createDotLottiePlayer(loadAnimation: (params: AnimationConfiguration) => AnimationItem,
  {
    animateOnScroll,
    autoplay,
    background,
    controls,
    description,
    direction = 1,
    hover,
    id,
    intermission,
    loop,
    loopLimit = 0,
    mode = PlayMode.Normal,
    objectFit = ObjectFit.Contain,
    onComplete,
    onError,
    onLoad,
    ref,
    renderer = RendererType.SVG,
    simple,
    speed = 1,
    src,
    subframe,
    ...rest
  }: React.HTMLAttributes<HTMLElement> & DotLottieProps) {
  return (
    <AppProvider
      animateOnScroll= { animateOnScroll }
      autoplay = { autoplay }
      controls = { controls }
      id = { id }
      loop = { loop }
      mode = { mode }
      simple = { simple }
      src = { src }
    >
      <Player
        background={ background }
        loopLimit = { loopLimit }
        description = { description }
        direction = { direction }
        hover = { hover }
        intermission = { intermission }
        loadAnimation = { loadAnimation }
        objectFit = { objectFit }
        renderer = { renderer }
        speed = { speed }
        subframe = { subframe }
        ref = { ref }
        onLoad = { onLoad }
        onError = { onError }
        onComplete = { onComplete }
        {...rest }
      />
    </AppProvider>
  )
}