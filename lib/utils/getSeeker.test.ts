import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import {
  describe, expect, test
} from 'vitest'

import { getSeeker } from '@/utils/getSeeker'

describe('getSeeker', () => {
  test('returns 0 when totalFrames is 0', () => {
    const item = {
      currentFrame: 10,
      totalFrames: 0,
    } as AnimationItem

    expect(getSeeker(item)).toBe(0)
  })

  test('returns rounded percentage of current frame', () => {
    const item = {
      currentFrame: 50,
      totalFrames: 200,
    } as AnimationItem

    expect(getSeeker(item)).toBe(25)
  })
})
