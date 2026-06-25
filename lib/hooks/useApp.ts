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

export function usePlayerPlayback() {
  return use(PlayerStateContext).playback
}

export function usePlayerState() {
  return use(PlayerStateContext).playback.playerState
}

// export function usePlayerPlaybackSelector<T>(selector: (playback: PlayerPlayback) => T): T {
//   const state = use(PlayerStateContext)

//   return useSyncExternalStore(
//     state.subscribe,
//     () => selector(state.getSnapShot().playback),
//     () => selector(state.getSnapShot().playback)
//   )
// }