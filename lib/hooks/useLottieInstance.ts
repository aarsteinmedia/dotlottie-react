import type {
  AnimationData, AnimationDirection, AnimationItem,
  AnimationSettings
} from '@aarsteinmedia/lottie-web'

import { getAnimationData } from '@aarsteinmedia/lottie-web/dotlottie'
import {
  useCallback, useEffect, useRef
} from 'react'

import type { UseLottieInstance } from '@/types'

import { PlayerEvents, PlayerState } from '@/enums'
import useApp from '@/hooks/useApp'
import { handleErrors, isLottie } from '@/utils'
import buildAnimationConfig from '@/utils/buildAnimationConfig'
import createInstance from '@/utils/createInstance'
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
    appStateRef = useRef(appState),

    mountAtIndex = useCallback((animations: AnimationData[], index: number) => {
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
    ]),

    load = useCallback(async (src: null | string) => {
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

        let nextIndex = 0,
          nextPlayerState = PlayerState.Stopped

        if (appState.autoplay) {
          nextPlayerState = PlayerState.Playing
        }

        setAppState(prev => {
          nextIndex = prev.currentAnimation

          return {
            ...prev,
            animations,
            isDotLottie,
            manifest,
            playerState: nextPlayerState
          }
        })

        const item = mountAtIndex(animations, nextIndex),
          settings = appState.multiAnimationSettings[nextIndex] as AnimationSettings | undefined,
          animationDirection = settings?.direction ?? direction

        item.setSpeed(settings?.speed ?? speed)
        item.setDirection(animationDirection)
        item.setSubframe(Boolean(subframe))

        if (animationDirection === -1) {
          handleSeek({
            animationItem: animationRef.current,
            setAppState,
            value: '99%'
          })
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
      appState.autoplay,
      appState.multiAnimationSettings,
      containerRef,
      direction,
      mountAtIndex,
      onLoadError,
      setAppState,
      speed,
      subframe
    ]),

    switchInstance = useCallback((index: number, isPrevious = false) => {
      const { animations } = appState

      if (!animations[index]) {
        return
      }

      try {
        mountAtIndex(animations, index)

        containerRef.current?.dispatchEvent(new CustomEvent(isPrevious ? PlayerEvents.Previous : PlayerEvents.Next))
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
      appState,
      containerRef,
      mountAtIndex,
      onLoadError,
      setAppState
    ]),

    /**
     * Set loop.
     */
    setLoop = (value: boolean) => {
      animationRef.current?.setLoop(value)
    },

    setSpeed = (value: number) => {
      animationRef.current?.setSpeed(value)
    },

    setDirection = (value: AnimationDirection) => {
      animationRef.current?.setDirection(value)
    },

    setSubframe = (value: boolean) => {
      animationRef.current?.setSubframe(value)
    }

  useEffect(() => {
    animationRef.current?.destroy()
    // eslint-disable-next-line react-hooks/immutability
    animationRef.current = null
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