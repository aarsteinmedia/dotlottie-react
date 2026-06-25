import { use } from 'react'

import AppContext from '@/context/AppContext'

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