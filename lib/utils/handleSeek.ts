import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import type { AppState } from '@/context/AppContext'

import { PlayerState } from '@/utils/enums'

interface Props {
  animationItem: null | AnimationItem
  setAppState: React.Dispatch<React.SetStateAction<AppState>>
  value: number | string
}

export function handleSeek({
  animationItem,
  setAppState,
  value
}: Props) {
  if (!animationItem) {
    return
  }

  // Extract frame number from either number or percentage value
  const matches = value.toString().match(/^(\d+)(%?)$/)

  if (!matches) {
    return
  }

  // Calculate and set the frame number
  const frame = Math.round(matches[2] === '%'
    ? animationItem.totalFrames * Number(matches[1]) / 100
    : Number(matches[1]))

  // Set seeker to new frame number
  setAppState(prev => {
    return {
      ...prev,
      seeker: frame
    }
  })

  // Send lottie player to the new frame
  animationItem.goToAndPlay(frame, true)
  setAppState(prev => {
    if (
      prev.playerState === PlayerState.Playing ||
      prev.playerState === PlayerState.Frozen &&
      prev.prevState === PlayerState.Playing
    ) {

      animationItem.goToAndPlay(frame, true)

      return {
        ...prev,
        playerState: PlayerState.Playing
      }
    }

    animationItem.goToAndStop(frame, true)
    animationItem.pause()

    return prev
  })
}