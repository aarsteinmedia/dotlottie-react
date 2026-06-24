import type {
  AnimationData,
  AnimationSettings, LottieManifest, Vector2
} from '@aarsteinmedia/lottie-web'
import type { PlayMode } from '@aarsteinmedia/lottie-web/utils'

import { createContext } from 'react'

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

export type PlayerSnapshot = PlayerConfig & PlayerAsset & PlayerPlayback

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<PlayerAction>
}>({
  dispatch: (value: React.SetStateAction<PlayerAction>) => value,
  state: createInitialState()
})

export default AppContext