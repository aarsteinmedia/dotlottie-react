import { PlayMode } from '@aarsteinmedia/lottie-web/utils'
import {
  describe, expect, test
} from 'vitest'

import { createInitialState, playerReducer } from '@/context/playerReducer'
import { PlayerState } from '@/utils/enums'

describe('playerReducer', () => {
  test('syncs config patches', () => {
    const state = createInitialState({
      autoplay: false,
      loop: false
    })

    const next = playerReducer(state, {
      patch: {
        autoplay: true,
        loop: true
      },
      type: 'SYNC_CONFIG',
    })

    expect(next.config.autoplay).toBeTruthy()
    expect(next.config.loop).toBeTruthy()
    expect(next.playback).toStrictEqual(state.playback)
  })

  test('enters loading state on LOAD_START', () => {
    const state = createInitialState({ src: null })

    // @ts-expect-error: readonly property
    state.playback.playerState = PlayerState.Playing

    const next = playerReducer(state, {
      src: '/animation.lottie',
      type: 'LOAD_START',
    })

    expect(next.config.src).toBe('/animation.lottie')
    expect(next.playback.playerState).toBe(PlayerState.Loading)
    expect(next.playback.prevState).toBe(PlayerState.Playing)
  })

  test('applies LOAD_SUCCESS payload and resets loop counter', () => {
    const state = createInitialState({ src: '/old.lottie' })

    // @ts-expect-error: readonly property
    state.playback.loopsCompleted = 3
    // @ts-expect-error: readonly property
    state.playback.seeker = 42

    const next = playerReducer(state, {
      payload: {
        animations: [{
          assets: [],
          chars: [],
          ddd: 0,
          fr: 30,
          h: 100,
          ip: 0,
          layers: [],
          nm: '',
          op: 60,
          v: '5.5.7',
          w: 100
        }],
        isDotLottie: true,
        manifest: {
          animations: [{
            id: 'a',
            speed: 1
          }]
        },
        mode: PlayMode.Bounce,
        playerState: PlayerState.Playing,
      },
      type: 'LOAD_SUCCESS',
    })

    expect(next.asset.animations).toHaveLength(1)
    expect(next.asset.isDotLottie).toBeTruthy()
    expect(next.config.mode).toBe(PlayMode.Bounce)
    expect(next.playback.playerState).toBe(PlayerState.Playing)
    expect(next.playback.loopsCompleted).toBe(0)
    expect(next.playback.seeker).toBe(0)
  })

  test('switches animation index and optional mode', () => {
    const state = createInitialState({ mode: PlayMode.Normal })

    const next = playerReducer(state, {
      currentAnimation: 2,
      mode: PlayMode.Bounce,
      type: 'SWITCH_ANIMATION',
    })

    expect(next.playback.currentAnimation).toBe(2)
    expect(next.config.mode).toBe(PlayMode.Bounce)
  })

  test('merges playback patches', () => {
    const state = createInitialState()

    const next = playerReducer(state, {
      patch: {
        loopsCompleted: 2,
        playerState: PlayerState.Paused,
        seeker: 50,
      },
      type: 'SET_PLAYBACK',
    })

    expect(next.playback.loopsCompleted).toBe(2)
    expect(next.playback.playerState).toBe(PlayerState.Paused)
    expect(next.playback.seeker).toBe(50)
  })
})
