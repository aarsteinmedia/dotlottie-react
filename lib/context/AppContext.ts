import type {
  AnimationData,
  AnimationSettings, LottieManifest, Vector2
} from '@aarsteinmedia/lottie-web'
import type { PlayMode } from '@aarsteinmedia/lottie-web/utils'

import { createContext, type Dispatch } from 'react'

import type { AppState, PlayerAction } from '@/types'
import type { PlayerState } from '@/utils/enums'

import { createInitialState } from '@/context/playerReducer'

export interface PlayerConfig {
  animateOnScroll?: boolean
  autoplay?: boolean
  controls?: boolean
  id?: string
  lang: string
  loop?: boolean
  mode: PlayMode
  simple?: boolean
  src: null | string
}

export interface PlayerAsset {
  animations: AnimationData[]
  isDotLottie: boolean
  manifest?: null | LottieManifest
  multiAnimationSettings: AnimationSettings[]
}

export interface PlayerPlayback {
  currentAnimation: number
  errorMessage: string
  loopsCompleted: number
  playerState: PlayerState
  prevState: PlayerState
  seeker: number
  segment: null | Vector2
}

export const PlayerDispatchContext = createContext<Dispatch<PlayerAction>>(() => {
  //
  }),
  PlayerStateContext = createContext<AppState>(createInitialState()),
  PlayerStateRefContext = createContext<React.RefObject<AppState>>({ current: createInitialState() })