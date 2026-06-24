import type { AnimationDirection, AnimationItem } from '@aarsteinmedia/lottie-web'

import { PlayMode } from '@aarsteinmedia/lottie-web/utils'
import { useEffect, useRef } from 'react'

import { PlayerEvents, PlayerState } from '@/enums'
import { useApp } from '@/hooks/useApp'
import { useEventListener } from '@/hooks/useEventListener'

interface Props {
  animationRef: React.RefObject<AnimationItem | null>
  containerRef: React.RefObject<HTMLElement | null>
  hover?: boolean
  intermission?: number
  loopLimit: number
  next: () => void
  onComplete?: () => void
  onError?: (message?: string) => void
  onLoad?: () => void
  play: () => void
  stop: () => void
  switchInstance: (index: number, isPrevious?: boolean) => void
}

export function usePlayerEvents({
  animationRef,
  containerRef: container,
  hover,
  intermission,
  loopLimit,
  next,
  onComplete,
  onError,
  onLoad,
  play,
  stop,
  switchInstance
}: Props) {
  const { appState, setAppState } = useApp(),

    intermissionTimeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null),
    animateOnScrollRef = useRef(appState.animateOnScroll),

    clearIntermissionTimeout = () => {
      if (intermissionTimeoutRef.current === null) {
        return
      }
      clearTimeout(intermissionTimeoutRef.current)
      intermissionTimeoutRef.current = null
    },

    complete = () => {
      if (!animationRef.current) {
        return
      }

      onComplete?.()

      if (appState.animations.length > 1) {
        if (
          appState.multiAnimationSettings[appState.currentAnimation + 1]?.autoplay
        ) {
          next()

          return
        }
        if (appState.loop && appState.currentAnimation === appState.animations.length - 1) {
          setAppState((prev) => {
            return {
              ...prev,
              currentAnimation: 0
            }
          })

          switchInstance(0)

          return
        }
      }

      const { currentFrame, totalFrames } = animationRef.current,
        seeker = Math.round(currentFrame / totalFrames * 100)

      setAppState(prev => {
        return {
          ...prev,
          playerState: PlayerState.Completed,
          seeker
        }
      })

      container.current?.dispatchEvent(new CustomEvent(PlayerEvents.Complete, {
        detail: {
          frame: currentFrame,
          seeker,
        },
      }))
    },

    dataReady = () => {
      container.current?.dispatchEvent(new CustomEvent(PlayerEvents.Ready))
    },

    /**
     * Handle MouseEnter.
     */
    mouseEnter = () => {
      if (hover && appState.playerState !== PlayerState.Playing) {
        play()
      }
    },

    /**
     * Handle MouseLeave.
     */
    mouseLeave = () => {
      if (hover && appState.playerState === PlayerState.Playing) {
        stop()
      }
    },

    /**
     * Set loop.
     */
    setLoop = (value: boolean) => {
      animationRef.current?.setLoop(value)
    },

    scheduleIntermissionPlay = () => {
      clearIntermissionTimeout()

      if (!intermission || intermission <= 0) {
        if (!animateOnScrollRef.current) {
          animationRef.current?.play()
        }

        return
      }

      intermissionTimeoutRef.current = setTimeout(() => {
        intermissionTimeoutRef.current = null
        if (!animateOnScrollRef.current) {
          animationRef.current?.play()
        }
      }, intermission)
    },

    loopComplete = () => {
      if (!animationRef.current) {
        return
      }

      const {
          playDirection,
          totalFrames,
        } = animationRef.current,
        inPoint = appState.segment ? appState.segment[0] : 0,
        outPoint = appState.segment ? appState.segment[1] : totalFrames

      if (loopLimit > 0) {
        let shouldContinue = true,
          loopsCompleted = appState.loopsCompleted + 1

        if (appState.mode === PlayMode.Bounce) {
          loopsCompleted = appState.loopsCompleted + 0.5
        }

        if (loopsCompleted >= loopLimit) {
          shouldContinue = false
        }

        setAppState(prev => {
          let { playerState } = prev

          if (!shouldContinue) {
            setLoop(false)

            playerState = PlayerState.Completed

            container.current?.dispatchEvent(new CustomEvent(PlayerEvents.Complete))
          }

          return {
            ...prev,
            loopsCompleted,
            playerState
          }
        })

        if (!shouldContinue) {
          return
        }
      }

      container.current?.dispatchEvent(new CustomEvent(PlayerEvents.Loop))

      if (appState.mode === PlayMode.Bounce) {
        animationRef.current.goToAndStop(playDirection === -1 ? inPoint : outPoint * 0.99,
          true)

        animationRef.current.setDirection((playDirection * -1) as AnimationDirection)

        scheduleIntermissionPlay()
      }

      animationRef.current.goToAndStop(playDirection === -1 ? outPoint * 0.99 : inPoint,
        true)

      scheduleIntermissionPlay()
    },

    enterFrame = () => {
      if (!animationRef.current) {
        return
      }
      const { currentFrame, totalFrames } = animationRef.current,
        seeker = Math.round(currentFrame / totalFrames * 100)

      setAppState(prev => {
        return {
          ...prev,
          seeker
        }
      })

      container.current?.dispatchEvent(new CustomEvent(PlayerEvents.Frame, {
        detail: {
          frame: currentFrame,
          seeker,
        },
      }))
    },

    dataFailed = () => {
      try {
        onError?.()
      } finally {
        setAppState(prev => ({
          ...prev,
          playerState: PlayerState.Error
        }))
        container.current?.dispatchEvent(new CustomEvent(PlayerEvents.Error))
      }
    },

    domLoaded = () => {
      onLoad?.()
      container.current?.dispatchEvent(new CustomEvent(PlayerEvents.Load))
    }


  useEventListener(
    'enterFrame', enterFrame, { element: animationRef }
  )
  useEventListener(
    'complete', complete, { element: animationRef }
  )
  useEventListener(
    'loopComplete', loopComplete, { element: animationRef }
  )
  useEventListener(
    'DOMLoaded', domLoaded, { element: animationRef }
  )
  useEventListener(
    'data_ready', dataReady, { element: animationRef }
  )
  useEventListener(
    'data_failed', dataFailed, { element: animationRef }
  )
  useEventListener(
    'mouseenter', mouseEnter, { element: container }
  )
  useEventListener(
    'mouseleave', mouseLeave, { element: container }
  )

  useEffect(() => {
    animateOnScrollRef.current = appState.animateOnScroll
  }, [appState.animateOnScroll])

  useEffect(() => clearIntermissionTimeout, [])
}