import type { AnimationDirection, AnimationItem } from '@aarsteinmedia/lottie-web'

import { PlayMode } from '@aarsteinmedia/lottie-web/utils'
import { useEffect, useRef } from 'react'

import { PlayerEvents, PlayerState } from '@/enums'
import {
  usePlayerDispatch, usePlayerPlayback, usePlayerConfig, usePlayerAsset
} from '@/hooks/useApp'
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
  const playback = usePlayerPlayback(),
    dispatch = usePlayerDispatch(),
    config = usePlayerConfig(),
    asset = usePlayerAsset(),

    intermissionTimeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null),
    animateOnScrollRef = useRef(config.animateOnScroll),

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

      if (asset.animations.length > 1) {
        if (
          asset.multiAnimationSettings[playback.currentAnimation + 1]?.autoplay
        ) {
          next()

          return
        }
        if (config.loop && playback.currentAnimation === asset.animations.length - 1) {

          dispatch({
            currentAnimation: 0,
            type: 'SWITCH_ANIMATION'
          })

          switchInstance(0)

          return
        }
      }

      const { currentFrame, totalFrames } = animationRef.current,
        seeker = Math.round(currentFrame / totalFrames * 100)

      dispatch({
        patch: {
          playerState: PlayerState.Completed,
          seeker
        },
        type: 'SET_PLAYBACK'
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
      if (hover && playback.playerState !== PlayerState.Playing) {
        play()
      }
    },

    /**
     * Handle MouseLeave.
     */
    mouseLeave = () => {
      if (hover && playback.playerState === PlayerState.Playing) {
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
        inPoint = playback.segment ? playback.segment[0] : 0,
        outPoint = playback.segment ? playback.segment[1] : totalFrames

      if (loopLimit > 0) {
        let shouldContinue = true,
          loopsCompleted = playback.loopsCompleted + 1

        if (config.mode === PlayMode.Bounce) {
          loopsCompleted = playback.loopsCompleted + 0.5
        }

        if (loopsCompleted >= loopLimit) {
          shouldContinue = false
        }

        let { playerState } = playback

        if (!shouldContinue) {
          setLoop(false)

          playerState = PlayerState.Completed

          container.current?.dispatchEvent(new CustomEvent(PlayerEvents.Complete))
        }

        dispatch({
          patch: {
            loopsCompleted,
            playerState
          },
          type: 'SET_PLAYBACK'
        })

        if (!shouldContinue) {
          return
        }
      }

      container.current?.dispatchEvent(new CustomEvent(PlayerEvents.Loop))

      if (config.mode === PlayMode.Bounce) {
        animationRef.current.goToAndStop(playDirection === -1 ? inPoint : outPoint * 0.99,
          true)

        animationRef.current.setDirection((playDirection * -1) as AnimationDirection)

        scheduleIntermissionPlay()

        return
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

      dispatch({
        patch: { seeker },
        type: 'SET_PLAYBACK'
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
        dispatch({
          patch: { playerState: PlayerState.Error },
          type: 'SET_PLAYBACK'
        })
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
    animateOnScrollRef.current = config.animateOnScroll
  }, [config.animateOnScroll])

  useEffect(() => clearIntermissionTimeout, [])
}