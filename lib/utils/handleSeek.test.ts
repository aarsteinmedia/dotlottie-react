import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import {
  describe, expect, vi, test
} from 'vitest'

import type { PlayerAction } from '@/types'

import { PlayerState } from '@/utils/enums'
import { handleSeek } from '@/utils/handleSeek'

function createAnimationItem(totalFrames = 100): AnimationItem {
  return {
    currentFrame: 0,
    goToAndPlay: vi.fn(),
    goToAndStop: vi.fn(),
    pause: vi.fn(),
    totalFrames,
  } as unknown as AnimationItem
}

describe('handleSeek', () => {
  test('does nothing without an animation item', () => {
    const dispatch = vi.fn<(action: PlayerAction) => void>()

    handleSeek({
      animationItem: null,
      dispatch,
      value: '50%',
    })

    expect(dispatch).not.toHaveBeenCalled()
  })

  test('seeks to a percentage while playing', () => {
    const animationItem = createAnimationItem(200),
      dispatch = vi.fn<(action: PlayerAction) => void>()

    handleSeek({
      animationItem,
      dispatch,
      seekOrigin: PlayerState.Playing,
      value: '50%',
    })

    expect(animationItem.goToAndPlay).toHaveBeenCalledWith(100, true)
    expect(animationItem.goToAndStop).not.toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith({
      patch: {
        playerState: PlayerState.Playing,
        seeker: 50,
      },
      type: 'SET_PLAYBACK',
    })
  })

  test('seeks to an absolute frame while paused', () => {
    const animationItem = createAnimationItem(100),
      dispatch = vi.fn<(action: PlayerAction) => void>()

    handleSeek({
      animationItem,
      dispatch,
      seekOrigin: PlayerState.Frozen,
      value: '25',
    })

    expect(animationItem.goToAndStop).toHaveBeenCalledWith(25, true)
    expect(animationItem.pause).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith({
      patch: {
        playerState: PlayerState.Frozen,
        seeker: 25,
      },
      type: 'SET_PLAYBACK',
    })
  })

  test('ignores invalid seek values', () => {
    const animationItem = createAnimationItem(),
      dispatch = vi.fn<(action: PlayerAction) => void>()

    handleSeek({
      animationItem,
      dispatch,
      value: 'not-a-frame',
    })

    expect(dispatch).not.toHaveBeenCalled()
  })
})
