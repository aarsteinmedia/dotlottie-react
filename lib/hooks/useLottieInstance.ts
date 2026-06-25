import type {
  AnimationData, AnimationDirection, AnimationItem,
  AnimationSettings,
} from '@aarsteinmedia/lottie-web'

import { getAnimationData } from '@aarsteinmedia/lottie-web/dotlottie'
import { createElementID, PlayMode } from '@aarsteinmedia/lottie-web/utils'
import {
  useCallback, useEffect, useRef
} from 'react'

import type {
  Payload, PlayerSnapshot, UseLottieInstance
} from '@/types'

import { PlayerEvents, PlayerState } from '@/enums'
import {
  usePlayerAsset, usePlayerConfig, usePlayerDispatch, usePlayerPlayback
} from '@/hooks/useApp'
import { handleErrors, isLottie } from '@/utils'
import { buildAnimationConfig } from '@/utils/buildAnimationConfig'
import { hasReducedMotion } from '@/utils/constants'
import { createInstance } from '@/utils/createInstance'
import { handleSeek } from '@/utils/handleSeek'

export function useLottieInstance({
  containerRef,
  direction = 1,
  loadAnimation,
  objectFit,
  onLoadError,
  renderer,
  speed = 1,
  subframe
}: UseLottieInstance) {
  const animationRef = useRef<null | AnimationItem>(null),
    loadGeneration = useRef(0),
    dispatch = usePlayerDispatch(),
    playback = usePlayerPlayback(),
    asset = usePlayerAsset(),
    config = usePlayerConfig(),
    appStateRef = useRef<PlayerSnapshot>({
      animateOnScroll: config.animateOnScroll,
      animations: asset.animations,
      autoplay: config.autoplay,
      currentAnimation: playback.currentAnimation,
      isDotLottie: asset.isDotLottie,
      loop: config.loop,
      manifest: asset.manifest,
      mode: config.mode,
      multiAnimationSettings: asset.multiAnimationSettings,
      playerState: playback.playerState
    })

  useEffect(() => {
    appStateRef.current = {
      animateOnScroll: config.animateOnScroll,
      animations: asset.animations,
      autoplay: config.autoplay,
      currentAnimation: playback.currentAnimation,
      isDotLottie: asset.isDotLottie,
      loop: config.loop,
      manifest: asset.manifest,
      mode: config.mode,
      multiAnimationSettings: asset.multiAnimationSettings,
      playerState: playback.playerState
    }
  }, [
    asset.animations,
    asset.isDotLottie,
    asset.manifest,
    asset.multiAnimationSettings,
    config.animateOnScroll,
    config.autoplay,
    config.loop,
    config.mode,
    playback.currentAnimation,
    playback.playerState
  ])

  const mountAtIndex = useCallback((animations: AnimationData[], index: number) => {
    const container = containerRef.current

    if (!container) {
      throw new Error('Container not rendered')
    }

    const options = buildAnimationConfig(
      container,
      {
        ...appStateRef.current,
        currentAnimation: index
      },
      objectFit,
      renderer
    )

    return createInstance(
      loadAnimation,
      animationRef,
      options,
      animations[index]
    )
  }, [
    containerRef,
    loadAnimation,
    objectFit,
    renderer
  ])

  const load = useCallback(async (src: null | string) => {
    if (!src) {
      return
    }

    const generation = ++loadGeneration.current

    dispatch({
      src,
      type: 'LOAD_START'
    })

    try {
      const {
        animations = [], isDotLottie, manifest
      } = await getAnimationData(src)

      if (generation !== loadGeneration.current) {
        return
      }

      if (!animations.every(isLottie)) {
        throw new Error('Broken or corrupted file')
      }

      if (manifest?.animations.length === 1) {
        manifest.animations[0].autoplay = appStateRef.current.autoplay
        manifest.animations[0].loop = appStateRef.current.loop
      }

      let { animateOnScroll: hasAnimateOnScroll } = appStateRef.current

      const {
          autoplay: hasAutoplay,
          currentAnimation,
          mode,
          multiAnimationSettings,
        } = appStateRef.current,
        nextIndex = currentAnimation,
        settings = multiAnimationSettings[nextIndex] as AnimationSettings | undefined

      let playerState: PlayerState = PlayerState.Stopped

      if (
        !hasAnimateOnScroll &&
        (hasAutoplay ||
          multiAnimationSettings[currentAnimation]?.autoplay)
      ) {
        playerState = PlayerState.Playing
      }

      let isBounce = mode === PlayMode.Bounce

      if (multiAnimationSettings.length > 0 && multiAnimationSettings[currentAnimation]?.mode) {
        isBounce =
          multiAnimationSettings[currentAnimation].mode ===
          PlayMode.Bounce
      }

      const payload: Payload = {
        animations,
        isDotLottie,
        manifest: manifest ?? {
          animations: [{
            autoplay: !hasAnimateOnScroll && hasAutoplay,
            direction,
            id: createElementID(),
            mode,
            speed
          }]
        },
        mode: isBounce ? PlayMode.Bounce : PlayMode.Normal,
        playerState
      }

      appStateRef.current = {
        ...appStateRef.current,
        ...payload,
      }

      dispatch({
        payload,
        type: 'LOAD_SUCCESS'
      })

      const item = mountAtIndex(animations, nextIndex),
        animationDirection = settings?.direction ?? direction

      item.setSpeed(settings?.speed ?? speed)
      item.setDirection(animationDirection)
      item.setSubframe(Boolean(subframe))

      // eslint-disable-next-line unicorn/consistent-destructuring
      hasAnimateOnScroll = appStateRef.current.animateOnScroll

      const { playerState: loadedPlayerState } = appStateRef.current

      if (
        !hasReducedMotion &&
        (loadedPlayerState === PlayerState.Playing || hasAnimateOnScroll)
      ) {
        if (animationDirection === -1) {
          handleSeek({
            animationItem: animationRef.current,
            dispatch,
            seekOrigin: loadedPlayerState,
            value: '99%'
          })
        }

        if (
          loadedPlayerState === PlayerState.Playing &&
          !('IntersectionObserver' in window) &&
          !hasAnimateOnScroll
        ) {
          item.play()
          containerRef.current?.dispatchEvent(new CustomEvent(PlayerEvents.Play))
        }
      }
    } catch (error) {
      if (generation !== loadGeneration.current) {
        return
      }

      const { message: errorMessage } = handleErrors(error)

      onLoadError?.(errorMessage)
      dispatch({
        patch: {
          errorMessage,
          playerState: PlayerState.Error
        },
        type: 'SET_PLAYBACK'
      })

      containerRef.current?.dispatchEvent(new CustomEvent(PlayerEvents.Error))
    }
  }, [
    containerRef,
    direction,
    dispatch,
    mountAtIndex,
    onLoadError,
    speed,
    subframe
  ])

  const switchInstance = useCallback((index: number, isPrevious = false) => {
    const state = appStateRef.current

    if (!state.animations[index]) {
      return
    }

    try {
      const item = mountAtIndex(state.animations, index),
        { mode: playMode } = state.multiAnimationSettings[index] ?? {}

      dispatch({
        currentAnimation: index,
        mode: playMode ?? PlayMode.Normal,
        type: 'SWITCH_ANIMATION'
      })

      containerRef.current?.dispatchEvent(new CustomEvent(isPrevious ? PlayerEvents.Previous : PlayerEvents.Next))

      const shouldAutoplay =
        state.multiAnimationSettings[index]?.autoplay ??
        state.autoplay

      if (shouldAutoplay) {
        if (state.animateOnScroll) {
          item.goToAndStop(0, true)
          dispatch({
            patch: { playerState: PlayerState.Paused },
            type: 'SET_PLAYBACK'
          })

          return
        }

        item.goToAndPlay(0, true)
        dispatch({
          patch: { playerState: PlayerState.Playing },
          type: 'SET_PLAYBACK'
        })

        return
      }

      item.goToAndStop(0, true)
      dispatch({
        patch: { playerState: PlayerState.Stopped },
        type: 'SET_PLAYBACK'
      })
    } catch (error) {
      const { message: errorMessage } = handleErrors(error)

      onLoadError?.(errorMessage)
      dispatch({
        patch: {
          errorMessage,
          playerState: PlayerState.Error
        },
        type: 'SET_PLAYBACK'
      })

      containerRef.current?.dispatchEvent(new CustomEvent(PlayerEvents.Error))
    }
  }, [
    containerRef,
    dispatch,
    mountAtIndex,
    onLoadError
  ])

  const setLoop = (value: boolean) => {
    animationRef.current?.setLoop(value)
  }

  const setSpeed = (value: number) => {
    animationRef.current?.setSpeed(value)
  }

  const setDirection = (value: AnimationDirection) => {
    animationRef.current?.setDirection(value)
  }

  const setSubframe = (value: boolean) => {
    animationRef.current?.setSubframe(value)
  }

  useEffect(() => {
    return () => {
      loadGeneration.current += 1
      animationRef.current?.destroy()
      animationRef.current = null
    }
  }, [])

  return {
    animationRef,
    load,
    setDirection,
    setLoop,
    setSpeed,
    setSubframe,
    switchInstance
  }
}