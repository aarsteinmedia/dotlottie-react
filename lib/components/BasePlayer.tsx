'use client'
import type {
  AnimationDirection,
  AnimationItem,
} from '@aarsteinmedia/lottie-web'

import {
  isServer,
  PlayerEvents, PlayMode
} from '@aarsteinmedia/lottie-web/utils'
import {
  useCallback, useRef, useState
} from 'react'

import ErrorMessage from '@/components/ErrorMessage'
import useApp from '@/hooks/useApp'
import useEventListener from '@/hooks/useEventListener'
import useIntersectionObserver from '@/hooks/useIntersectionObserver'
import useIsVisible from '@/hooks/useIsVisible'
import styles from '@/styles/player.module.css'
import { PlayerState } from '@/utils/enums'

const dataReady = () => {
  dispatchEvent(new CustomEvent(PlayerEvents.Load))
}

interface InlineInterface {
  background?: string
  count?: number
  description?: string
  hover?: boolean
  intermission?: number
}

/**
 * HOC.
 */
export default function BasePlayer({
  background,
  count = 0,
  description,
  hover,
  intermission,
  ...rest
}: InlineInterface) {

  const { appState, setAppState } = useApp(),
    container = useRef<HTMLElement>(null),
    animationItem = useRef<AnimationItem>(null),
    isVisible = useIsVisible(container.current),
    [state, setState] = useState<{
      errorMessage: string
      isVisible: boolean
      scrollTimeout: null | NodeJS.Timeout
      scrollY: number
      isLoaded: boolean
    }>({
      errorMessage: 'Unknown error',
      isLoaded: false,
      isVisible,
      scrollTimeout: null,
      scrollY: 0
    }),

    /**
     * Stop.
     */
    stop = useCallback(() => {
      if (!animationItem.current) {
        return
      }

      animationItem.current.stop()
      dispatchEvent(new CustomEvent(PlayerEvents.Stop))
      setAppState((prev) => ({
        ...prev,
        count: 0,
        playerState: PlayerState.Stopped,
        prevState: prev.playerState
      }))
    }, [setAppState]),

    /**
     * Play.
     */
    play = useCallback(() => {
      if (!animationItem.current) {
        return
      }

      animationItem.current.play()
      dispatchEvent(new CustomEvent(PlayerEvents.Play))
      setAppState(prev => {
        return {
          ...prev,
          playerState: PlayerState.Playing
        }
      })
    }, [setAppState]),

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
     * Freeze animation.
     * This internal state pauses animation and is used to differentiate between
     * user requested pauses and component instigated pauses.
     */
    freeze = () => {
      if (!animationItem.current) {
        return
      }

      animationItem.current.pause()
      dispatchEvent(new CustomEvent(PlayerEvents.Freeze))
      setAppState(prev => {
        return {
          ...prev,
          playerState: PlayerState.Frozen,
          prevState: prev.playerState === PlayerState.Frozen ? prev.prevState : prev.playerState
        }
      })
    },

    /**
     * Set loop.
     */
    setLoop = (value: boolean) => {
      animationItem.current?.setLoop(value)
    },

    loopComplete = () => {
      if (!animationItem.current) {
        return
      }

      const {
          playDirection,
          // firstFrame,
          totalFrames,
        } = animationItem.current,
        inPoint = appState.segment ? appState.segment[0] : 0,
        outPoint = appState.segment ? appState.segment[0] : totalFrames

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

          dispatchEvent(new CustomEvent(PlayerEvents.Complete))

          return
        }
      }

      dispatchEvent(new CustomEvent(PlayerEvents.Loop))

      if (appState.mode === PlayMode.Bounce) {
        animationItem.current.goToAndStop(playDirection === -1 ? inPoint : outPoint * 0.99,
          true)

        animationItem.current.setDirection((playDirection * -1) as AnimationDirection)

        return setTimeout(() => {
          if (!appState.animateOnScroll) {
            animationItem.current?.play()
          }
        }, intermission)
      }

      animationItem.current.goToAndStop(playDirection === -1 ? outPoint * 0.99 : inPoint,
        true)

      return setTimeout(() => {
        if (!appState.animateOnScroll) {
          animationItem.current?.play()
        }
      }, intermission)
    },

    enterFrame = () => {
      if (!animationItem.current) {
        return
      }
      const { currentFrame, totalFrames } = animationItem.current,
        seeker = Math.round(currentFrame / totalFrames * 100)

      setAppState(prev => {
        return {
          ...prev,
          seeker
        }
      })

      dispatchEvent(new CustomEvent(PlayerEvents.Frame, {
        detail: {
          frame: currentFrame,
          seeker,
        },
      }))
    },

    /**
     * Handle scroll.
     */
    handleScroll = () => {
      if (!appState.animateOnScroll || !animationItem.current) {
        return
      }
      if (isServer) {
        console.warn('DotLottie: Scroll animations might not work properly in a Server Side Rendering context. Try to wrap this in a client component.')

        return
      }
      if (state.isVisible) {
        if (state.scrollTimeout) {
          clearTimeout(state.scrollTimeout)
        }
        state.scrollTimeout = setTimeout(() => {
          setState(prev => {
            return {
              ...prev,
              playerState: PlayerState.Paused
            }
          })
        }, 400)

        const adjustedScroll =
          scrollY > state.scrollY
            ? scrollY - state.scrollY
            : state.scrollY - scrollY,
          clampedScroll = Math.min(Math.max(adjustedScroll / 3, 1),
            animationItem.current.totalFrames * 3),
          roundedScroll = clampedScroll / 3

        requestAnimationFrame(() => {
          if (roundedScroll < (animationItem.current?.totalFrames ?? 0)) {
            setAppState(prev => {
              return {
                ...prev,
                playerState: PlayerState.Playing
              }
            })
            animationItem.current?.goToAndStop(roundedScroll, true)
          } else {
            setAppState(prev => {
              return {
                ...prev,
                playerState: PlayerState.Paused
              }
            })
          }
        })
      }
    },

    handleWindowBlur = ({ type }: FocusEvent) => {
      if (appState.playerState === PlayerState.Playing && type === 'blur') {
        freeze()
      }
      if (
        appState.playerState === PlayerState.Frozen &&
        appState.prevState === PlayerState.Playing &&
        !appState.animateOnScroll &&
        type === 'focus'
      ) {
        play()
      }
    },

    dataFailed = () => {
      setAppState(prev => ({
        ...prev,
        playerState: PlayerState.Error
      }))
      dispatchEvent(new CustomEvent(PlayerEvents.Error))
    },

    domLoaded = () => {
      setState(prev => ({
        ...prev,
        isLoaded: true
      }))
      dispatchEvent(new CustomEvent(PlayerEvents.Ready))
    }

  // Intersection Observer
  useIntersectionObserver(
    /**
     * On visible.
     */
    () => {
      if (!appState.animateOnScroll && appState.playerState === PlayerState.Frozen) {
        play()
      }
      if (!state.scrollY) {
        setState(prev => ({
          ...prev,
          scrollY
        }))
      }
      setState(prev => ({
        ...prev,
        isVisible: true
      }))
    },
    /**
     * On hidden.
     */
    () => {
      if (appState.playerState === PlayerState.Playing) {
        freeze()
      }
      setState(prev => ({
        ...prev,
        isVisible: false
      }))
    },
    // To observe.
    container.current
  )

  // Event listeners.
  useEventListener(
    'enterFrame', enterFrame, { element: animationItem }
  )
  useEventListener(
    'loopComplete', loopComplete, { element: animationItem }
  )
  useEventListener(
    'DOMLoaded', domLoaded, { element: animationItem }
  )
  useEventListener(
    'data_ready', dataReady, { element: animationItem }
  )
  useEventListener(
    'data_failed', dataFailed, { element: animationItem }
  )
  useEventListener(
    'mouseenter', mouseEnter, { element: container }
  )
  useEventListener(
    'mouseleave', mouseLeave, { element: container }
  )
  useEventListener(
    'focus', handleWindowBlur, {
      capture: false,
      passive: true
    }
  )
  useEventListener(
    'blur', handleWindowBlur, {
      capture: false,
      passive: true
    }
  )
  useEventListener(
    'scroll', handleScroll, {
      capture: true,
      passive: true
    }
  )

  return (
    <div
      className={styles.dotLottie}
      lang={appState.lang}
      aria-label={description}
      data-controls={appState.controls}
      {...rest}
    >
      <figure className={styles.animation} ref={container} style={{ background }}>
        {appState.playerState === PlayerState.Error &&
          <div className={styles.error}>
            <ErrorMessage message={state.errorMessage} />
          </div>
        }
      </figure>
    </div>
  )
}
