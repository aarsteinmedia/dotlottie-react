import { PlayMode, RendererType } from '@aarsteinmedia/lottie-web/utils'
import {
  describe, expect, test
} from 'vitest'

import { createInitialState } from '@/context/playerReducer'
import { buildAnimationConfig } from '@/utils/buildAnimationConfig'
import { ObjectFit } from '@/utils/enums'

describe('buildAnimationConfig', () => {
  test('disables autoplay when animateOnScroll is enabled', () => {
    const container = document.createElement('div'),
      state = createInitialState({
        animateOnScroll: true,
        autoplay: true,
        src: '/animation.lottie',
      })

    const config = buildAnimationConfig(
      container,
      state,
      ObjectFit.Contain,
      RendererType.SVG
    )

    expect(config.autoplay).toBeFalsy()
    expect(config.container).toBe(container)
    expect(config.loop).toBeFalsy()
  })

  test('offsets positive segments to zero-based frames', () => {
    const container = document.createElement('div'),
      state = createInitialState({ src: '/animation.lottie' })

    // @ts-expect-error: readonly property
    state.playback.segment = [10, 60]

    const config = buildAnimationConfig(
      container,
      state,
      ObjectFit.Cover,
      RendererType.Canvas
    )

    expect(config.initialSegment).toStrictEqual([9, 59])
    expect(config.renderer).toBe(RendererType.Canvas)
  })

  test('prefers per-animation manifest loop settings', () => {
    const container = document.createElement('div'),
      state = createInitialState({
        loop: false,
        mode: PlayMode.Normal,
        src: '/animation.lottie',
      })

    // @ts-expect-error: readonly property
    state.asset.manifest = {
      animations: [{
        id: 'a',
        loop: true,
        speed: 1,
      }],
    }

    const config = buildAnimationConfig(
      container,
      state,
      ObjectFit.Contain,
      RendererType.SVG
    )

    expect(config.loop).toBeTruthy()
  })
})
