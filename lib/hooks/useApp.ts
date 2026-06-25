import { use } from 'react'

import AppContext, { type PlayerPlayback } from '@/context/AppContext'

export function usePlayerAsset() {
  return use(AppContext).state.asset
}

export function usePlayerConfig() {
  return use(AppContext).state.config
}

export function usePlayerPlayback() {
  return use(AppContext).state.playback
}

export function usePlayerDispatch() {
  return use(AppContext).dispatch
}

export function usePlayerPlaybackSelector<T>(selector: (playback: PlayerPlayback) => T): T {
  const { playback } = use(AppContext).state

  return selector(playback)
}