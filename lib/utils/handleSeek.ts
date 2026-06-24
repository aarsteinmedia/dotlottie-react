import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import type { AppState } from '@/context/AppContext'

import { PlayerState } from '@/utils/enums'

interface Props {
  animationItem: null | AnimationItem
  /** Playback state when the scrub started (before freeze). */
  seekOrigin?: PlayerState
  setAppState: React.Dispatch<React.SetStateAction<AppState>>
  value: number | string
}

export function handleSeek({
  animationItem,
  seekOrigin,
  setAppState,
  value
}: Props) {
  if (!animationItem) {
    return
  }

  const matches = value.toString().match(/^(\d+)(%?)$/)

  if (!matches) {
    return
  }

  const frame = Math.round(matches[2] === '%'
      ? animationItem.totalFrames * Number(matches[1]) / 100
      : Number(matches[1])),
    seeker = matches[2] === '%'
      ? Number(matches[1])
      : Math.round(frame / animationItem.totalFrames * 100)

  if (seekOrigin === PlayerState.Playing) {
    animationItem.goToAndPlay(frame, true)
    setAppState(prev => ({
      ...prev,
      playerState: PlayerState.Playing,
      seeker
    }))

    return
  }

  animationItem.goToAndStop(frame, true)
  animationItem.pause()

  setAppState(prev => ({
    ...prev,
    playerState: seekOrigin ?? prev.playerState,
    seeker
  }))
}
