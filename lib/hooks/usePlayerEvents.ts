import type { AnimationDirection, AnimationItem } from '@aarsteinmedia/lottie-web'

import { PlayMode } from '@aarsteinmedia/lottie-web/utils'

import { PlayerEvents, PlayerState } from '@/enums'
import useApp from '@/hooks/useApp'
import useEventListener from '@/hooks/useEventListener'

interface Props {
  animationRef: React.RefObject<AnimationItem | null>
  containerRef: React.RefObject<HTMLElement | null>
  count: number
  hover?: boolean
  intermission?: number
  next: () => void
  onComplete?: () => void
  onError?: () => void
  onLoad?: () => void
  play: () => void
  stop: () => void
  switchInstance: (index: number, isPrevious?: boolean) => void
}

export function usePlayerEvents({
  animationRef,
  containerRef: container,
  count,
  hover,
  intermission,
  next,
  onComplete,
  onError,
  onLoad,
  play,
  stop,
  switchInstance
}: Props) {
  const { appState, setAppState } = useApp(),

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

    loopComplete = () => {
      if (!animationRef.current) {
        return
      }

      const {
          playDirection,
          // firstFrame,
          totalFrames,
        } = animationRef.current,
        inPoint = appState.segment ? appState.segment[0] : 0,
        outPoint = appState.segment ? appState.segment[1] : totalFrames

      if (appState.count) {
        if (appState.mode === PlayMode.Bounce) {
          setAppState(prev => ({
            ...prev,
            count: prev.count + 0.5
          }))
        } else {
          setAppState(prev => ({
            ...prev,
            count: prev.count + 1
          }))
        }

        if (appState.count >= count) {
          setLoop(false)

          setAppState(prev => ({
            ...prev,
            playerState: PlayerState.Completed
          }))

          container.current?.dispatchEvent(new CustomEvent(PlayerEvents.Complete))

          return
        }
      }

      container.current?.dispatchEvent(new CustomEvent(PlayerEvents.Loop))

      if (appState.mode === PlayMode.Bounce) {
        animationRef.current.goToAndStop(playDirection === -1 ? inPoint : outPoint * 0.99,
          true)

        animationRef.current.setDirection((playDirection * -1) as AnimationDirection)

        return setTimeout(() => {
          if (!appState.animateOnScroll) {
            animationRef.current?.play()
          }
        }, intermission)
      }

      animationRef.current.goToAndStop(playDirection === -1 ? outPoint * 0.99 : inPoint,
        true)

      return setTimeout(() => {
        if (!appState.animateOnScroll) {
          animationRef.current?.play()
        }
      }, intermission)
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
}