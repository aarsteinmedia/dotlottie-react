import { createContext } from 'react'

import { PlayerState } from '@/utils/enums'

export interface AppState {
  animateOnScroll?: boolean
  autoplay?: boolean
  controls?: boolean
  id?: string
  lang?: string
  loop?: boolean
  playerState?: PlayerState
  simple?: boolean
  src: null | string
}

const defaultValue: AppState = {
  playerState: PlayerState.Loading,
  src: null
}

const AppContext = createContext({
  appState: defaultValue,
  setAppState: React.Dispatch<React.SetStateAction<AppState>>
})

export { AppContext as default, defaultValue }