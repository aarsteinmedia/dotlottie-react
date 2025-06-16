import type {
  AnimationData,
  AnimationSettings, LottieManifest, Vector2
} from '@aarsteinmedia/lottie-web'

import { createContext } from 'react'

import { PlayerState } from '@/utils/enums'

export interface AppState {
  animateOnScroll?: boolean
  animations: AnimationData[]
  autoplay?: boolean
  controls?: boolean
  count: number
  currentAnimation: number
  id?: string
  isBounce?: boolean
  lang?: string
  loop?: boolean
  manifest?: LottieManifest
  multiAnimationSettings: AnimationSettings[]
  playerState: PlayerState
  prevState: PlayerState
  seeker: number
  segment?: Vector2
  simple?: boolean
  src: null | string
}

const defaultValue: AppState = {
  animations: [],
  count: 0,
  currentAnimation: 0,
  multiAnimationSettings: [],
  playerState: PlayerState.Loading,
  prevState: PlayerState.Loading,
  seeker: 0,
  src: null
}

const AppContext = createContext<{
  appState: Readonly<AppState>
  setAppState: React.Dispatch<React.SetStateAction<AppState>>
}>({
  appState: defaultValue,
  setAppState: (value: React.SetStateAction<AppState>) => value,
})

export { AppContext as default, defaultValue }