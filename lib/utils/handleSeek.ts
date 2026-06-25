import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import type { PlayerAction } from '@/types'

import { PlayerState } from '@/utils/enums'

interface Props {
  animationItem: null | AnimationItem
  dispatch: React.Dispatch<PlayerAction>
  /** Playback state when the scrub started (before freeze). */
  seekOrigin?: PlayerState
  value: number | string
}

export function handleSeek({
  animationItem,
  dispatch,
  seekOrigin,
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
    dispatch({
      patch: {
        playerState: PlayerState.Playing,
        seeker
      },
      type: 'SET_PLAYBACK'
    })

    return
  }

  animationItem.goToAndStop(frame, true)
  animationItem.pause()

  dispatch({
    patch: {
      playerState: seekOrigin ?? PlayerState.Paused,
      seeker
    },
    type: 'SET_PLAYBACK'
  })
}
