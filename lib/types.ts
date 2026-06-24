import type {
  AnimationConfiguration,
  AnimationDirection,
  AnimationItem,
  AnimationSegment,
  AnimationSettings,
} from '@aarsteinmedia/lottie-web'
import type {
  addAnimation,
  convert,
} from '@aarsteinmedia/lottie-web/dotlottie'
import type { PlayMode, RendererType } from '@aarsteinmedia/lottie-web/utils'

import type { AppState } from '@/context/AppContext'
import type { ObjectFit } from '@/utils/enums'

export interface DotLottieProps {
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
  onComplete?: (e?: Event) => void
  onError?: (e?: Event) => void
  onLoad?: (e?: Event) => void
  ref?: React.RefObject<DotLottieMethods | null>
  renderer?: RendererType
  simple?: boolean
  speed?: number
  src: string
  subframe?: boolean
}

export interface DotLottieMethods {
  addAnimation: (
    ...args: Parameters<typeof addAnimation>
  ) => ReturnType<typeof addAnimation>
  convert: (
    ...args: Parameters<typeof convert>
  ) => ReturnType<typeof convert>
  getIsVisible: () => boolean
  load: (src: string | null) => Promise<void>
  next: () => void
  pause: () => void
  play: () => void
  previous: () => void
  seek: (value: number | string) => void
  setCount: (value: number) => void
  setDirection: (value: AnimationDirection) => void
  setLoop: (value: boolean) => void
  setMultiAnimationSettings: (settings: AnimationSettings[]) => void
  setSegment: (value: AnimationSegment) => void
  setSpeed: (value: number) => void
  setSubframe: (value: boolean) => void
  stop: () => void
}

export interface UseLottieInstance {
  appState: AppState
  containerRef: React.RefObject<HTMLElement | null>
  direction?: AnimationDirection
  loadAnimation: (config: AnimationConfiguration) => AnimationItem
  objectFit: ObjectFit
  onLoadError?: (message: string) => void
  renderer: RendererType
  speed?: number
  subframe?: boolean
}