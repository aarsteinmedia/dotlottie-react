import type {
  AnimationConfiguration,
  AnimationDirection,
  AnimationItem,
  AnimationSegment,
  AnimationData,
  AnimationSettings,
  LottieManifest,
  Vector2
} from '@aarsteinmedia/lottie-web'
import type {
  addAnimation,
  convert,
} from '@aarsteinmedia/lottie-web/dotlottie'
import type { PlayMode, RendererType } from '@aarsteinmedia/lottie-web/utils'

import type {
  PlayerAsset, PlayerConfig, PlayerPlayback
} from '@/context/AppContext'
import type { ObjectFit, PlayerState } from '@/utils/enums'

export interface DotLottieProps {
  animateOnScroll?: boolean
  autoplay?: boolean
  background?: string
  className?: string
  controls?: boolean
  description?: string
  direction?: AnimationDirection
  hover?: boolean
  id?: string
  intermission?: number
  lang?: string
  loop?: boolean
  loopLimit?: number
  mode?: PlayMode,
  objectFit?: ObjectFit
  onComplete?: () => void
  onError?: (message?: string) => void
  onFrame?: (detail: {
    frame: number
    seeker: number
  }) => void
  onLoad?: () => void
  onLoop?: () => void
  ref?: React.Ref<DotLottieMethods | null>
  renderer?: RendererType
  simple?: boolean
  speed?: number
  src: string
  subframe?: boolean
}

export type PlayerProps = Omit<DotLottieProps, 'src'> & { loadAnimation: (params: AnimationConfiguration) => AnimationItem }

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
  setDirection: (value: AnimationDirection) => void
  setLoop: (value: boolean) => void
  setLoopsCompleted: (value: number) => void
  setMultiAnimationSettings: (settings: AnimationSettings[]) => void
  setSegment: (value: AnimationSegment) => void
  setSpeed: (value: number) => void
  setSubframe: (value: boolean) => void
  stop: () => void
}

export interface UseLottieInstance {
  containerRef: React.RefObject<HTMLElement | null>
  direction?: AnimationDirection
  loadAnimation: (config: AnimationConfiguration) => AnimationItem
  objectFit: ObjectFit
  onLoadError?: (message: string) => void
  renderer: RendererType
  speed?: number
  subframe?: boolean
}

export interface AppState {
  asset: Readonly<PlayerAsset>
  config: Readonly<PlayerConfig>
  playback: Readonly<PlayerPlayback>
}

// export type PlayerSnapshot = PlayerConfig & PlayerAsset & PlayerPlayback
export type PlayerSnapshot = Omit<Payload, 'manifest'> & {
  animateOnScroll?: boolean
  autoplay?: boolean
  currentAnimation: number
  loop?: boolean
  multiAnimationSettings: AnimationSettings[]
  segment?: Vector2
  manifest?: null | LottieManifest
}
export interface Payload {
  animations: AnimationData[];
  isDotLottie: boolean;
  manifest: LottieManifest;
  mode: PlayMode;
  playerState: PlayerState
}

export type PlayerAction =
  | {
    type: 'SYNC_CONFIG'
    patch: Partial<PlayerConfig>
  }
  | {
    type: 'LOAD_START'
    src: string
  }
  | {
    type: 'LOAD_SUCCESS'
    payload: {
      animations: AnimationData[]
      isDotLottie: boolean
      manifest: LottieManifest
      playerState: PlayerState
      mode: PlayMode
    }
  }
  | {
    type: 'LOAD_ERROR'
    errorMessage: string
  }
  | {
    type: 'SET_PLAYBACK'
    patch: Partial<PlayerPlayback>
  }
  | {
    type: 'SET_MULTI_ANIMATION_SETTINGS'
    settings: AnimationSettings[]
  }
  | {
    type: 'SET_SEGMENT'
    segment: Vector2
  }
  | {
    type: 'SWITCH_ANIMATION'
    currentAnimation: number
    mode?: PlayMode
  }