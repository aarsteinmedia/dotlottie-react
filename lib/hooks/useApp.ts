import { use } from 'react'

import {
  PlayerDispatchContext, PlayerStateContext, PlayerStateRefContext,
} from '@/context/AppContext'

export function usePlayerDispatch() {
  return use(PlayerDispatchContext)
}

export function usePlayerStateRef() {
  return use(PlayerStateRefContext)
}

export function usePlayerStore() {
  return use(PlayerStateContext)
}

export function usePlayerPlayback() {
  return use(PlayerStateContext).playback
}

export function usePlayerState() {
  return use(PlayerStateContext).playback.playerState
}