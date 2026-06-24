import type {
  AnimationData, AnimationDirection, AnimationItem,
  AnimationSettings
} from '@aarsteinmedia/lottie-web'

import { getAnimationData } from '@aarsteinmedia/lottie-web/dotlottie'
import { createElementID, PlayMode } from '@aarsteinmedia/lottie-web/utils'
import {
  useCallback, useEffect, useRef
} from 'react'

import type { UseLottieInstance } from '@/types'

import { PlayerEvents, PlayerState } from '@/enums'
import { useApp } from '@/hooks/useApp'
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
    { appState, setAppState } = useApp(),
    appStateRef = useRef(appState)

  useEffect(() => {
    appStateRef.current = appState
  }, [appState])

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

    setAppState(prev => ({
      ...prev,
      src
    }))

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

      let nextIndex = 0,
        playerState: PlayerState = PlayerState.Stopped,
        settings: AnimationSettings | undefined

      setAppState(prev => {
        nextIndex = prev.currentAnimation
        settings = prev.multiAnimationSettings[nextIndex]

        if (
          !prev.animateOnScroll &&
          (prev.autoplay ||
            prev.multiAnimationSettings[prev.currentAnimation]?.autoplay)
        ) {
          playerState = PlayerState.Playing
        }

        let isBounce = prev.mode === PlayMode.Bounce

        if (prev.multiAnimationSettings.length > 0 && prev.multiAnimationSettings[prev.currentAnimation]?.mode) {
          isBounce =
            prev.multiAnimationSettings[prev.currentAnimation].mode as PlayMode ===
            PlayMode.Bounce
        }

        const nextState = {
          ...prev,
          animations,
          isDotLottie,
          manifest: manifest ?? {
            animations: [{
              autoplay: !prev.animateOnScroll && prev.autoplay,
              direction,
              id: createElementID(),
              mode: prev.mode,
              speed
            }]
          },
          mode: isBounce ? PlayMode.Bounce : PlayMode.Normal,
          playerState
        }

        appStateRef.current = nextState

        return nextState
      })

      const item = mountAtIndex(animations, nextIndex),
        animationDirection = settings?.direction ?? direction

      item.setSpeed(settings?.speed ?? speed)
      item.setDirection(animationDirection)
      item.setSubframe(Boolean(subframe))

      const {
        animateOnScroll: hasAnimateOnScroll,
        playerState: loadedPlayerState
      } = appStateRef.current

      if (
        !hasReducedMotion &&
        (loadedPlayerState === PlayerState.Playing || hasAnimateOnScroll)
      ) {
        if (animationDirection === -1) {
          handleSeek({
            animationItem: animationRef.current,
            seekOrigin: loadedPlayerState,
            setAppState,
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
      setAppState(prev => ({
        ...prev,
        errorMessage,
        playerState: PlayerState.Error
      }))

      containerRef.current?.dispatchEvent(new CustomEvent(PlayerEvents.Error))
    }
  }, [
    containerRef,
    direction,
    mountAtIndex,
    onLoadError,
    setAppState,
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

      setAppState(prev => ({
        ...prev,
        mode: playMode ?? PlayMode.Normal,
      }))

      containerRef.current?.dispatchEvent(new CustomEvent(isPrevious ? PlayerEvents.Previous : PlayerEvents.Next))

      const shouldAutoplay =
        state.multiAnimationSettings[index]?.autoplay ??
        state.autoplay

      if (shouldAutoplay) {
        if (state.animateOnScroll) {
          item.goToAndStop(0, true)
          setAppState(prev => ({
            ...prev,
            playerState: PlayerState.Paused
          }))

          return
        }

        item.goToAndPlay(0, true)
        setAppState(prev => ({
          ...prev,
          playerState: PlayerState.Playing
        }))

        return
      }

      item.goToAndStop(0, true)
      setAppState(prev => ({
        ...prev,
        playerState: PlayerState.Stopped
      }))
    } catch (error) {
      const { message: errorMessage } = handleErrors(error)

      onLoadError?.(errorMessage)
      setAppState(prev => ({
        ...prev,
        errorMessage,
        playerState: PlayerState.Error
      }))

      containerRef.current?.dispatchEvent(new CustomEvent(PlayerEvents.Error))
    }
  }, [
    containerRef,
    mountAtIndex,
    onLoadError,
    setAppState
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