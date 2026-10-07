import type { AnimationData } from '@aarsteinmedia/lottie-web'

import { isServer, PreserveAspectRatio } from '@aarsteinmedia/lottie-web/utils'

import type { AppState } from '@/types'

import { ObjectFit, PlayerState } from '@/utils/enums'

export const aspectRatio = (objectFit: ObjectFit) => {
    switch (objectFit) {
      case ObjectFit.Contain:
      case ObjectFit.ScaleDown: {
        return PreserveAspectRatio.Contain
      }
      case ObjectFit.Cover: {
        return PreserveAspectRatio.Cover
      }
      case ObjectFit.Fill: {
        return PreserveAspectRatio.Initial
      }
      case ObjectFit.None: {
        return PreserveAspectRatio.None
      }
      default: {
        return PreserveAspectRatio.Contain
      }
    }
  },

  classnames = (classNames: string[]) => {
    return classNames.join(' ')
  },

  handleErrors = (err: unknown) => {
    const res = {
      message: 'Unknown error',
      status: isServer ? 500 : 400,
    }

    if (err && typeof err === 'object') {
      if ('message' in err && typeof err.message === 'string') {
        res.message = err.message
      }
      if ('status' in err) {
        res.status = Number(err.status)
      }
    }

    return res
  },

  isLottie = (json: AnimationData) => {
    const mandatory = [
      'v',
      'ip',
      'op',
      'layers',
      'fr',
      'w',
      'h'
    ]

    return mandatory.every((field: string) =>
      Object.hasOwn(json, field))
  },

  /**
   * Freeze animation.
   * This internal state pauses animation and is used to differentiate between
   * user requested pauses and component instigated pauses.
   */
  isPlaybackLocked = (stateRef: React.RefObject<AppState>) => {
    const { playerState } = stateRef.current.playback

    return playerState === PlayerState.Error || playerState === PlayerState.Loading
  },

  frameOutput = (frame?: number) =>
    ((frame ?? 0) + 1).toString().padStart(3, '0')
