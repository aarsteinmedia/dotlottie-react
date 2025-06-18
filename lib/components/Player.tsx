'use client'
import Lottie, {
  type AnimationConfiguration,
  type AnimationDirection,
  type AnimationItem,
  type AnimationSegment,
  type AnimationSettings,
} from '@aarsteinmedia/lottie-web'
import {
  clamp,
  createElementID,
  isServer,
  PlayerEvents, PlayMode, RendererType
} from '@aarsteinmedia/lottie-web/utils'
import {
  use, useCallback, useEffect, useImperativeHandle, useRef, useState
} from 'react'

import type { DotLottieMethods } from '@/types'

import Controls from '@/components/Controls'
import ErrorMessage from '@/components/ErrorMessage'
import AppContext from '@/context/AppContext'
import useEventListener from '@/hooks/useEventListener'
import useIntersectionObserver from '@/hooks/useIntersectionObserver'
import useIsVisible from '@/hooks/useIsVisible'
import styles from '@/styles/player.module.css'
import {
  aspectRatio, handleErrors, isLottie
} from '@/utils'
import addAnimation from '@/utils/addAnimation'
import convert from '@/utils/convert'
import { type ObjectFit, PlayerState } from '@/utils/enums'
import getAnimationData from '@/utils/getAnimationData'

const dataReady = () => {
  dispatchEvent(new CustomEvent(PlayerEvents.Load))
}

/**
 * DotLottie Player Web Component.
 */
export default function Player({
  background,
  count = 0,
  description,
  direction = 1,
  hover,
  intermission,
  objectFit = 'contain',
  ref,
  renderer = RendererType.SVG,
  speed = 1,
  subframe,
  ...rest
}: {
  background?: string
  count?: number
  description?: string
  direction?: AnimationDirection,
  hover?: boolean
  intermission?: number
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  renderer?: RendererType
  speed?: number,
  subframe?: boolean
  ref?: React.RefObject<DotLottieMethods | null>
}){

  const { appState, setAppState } = use(AppContext),
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

    getOptions = useCallback(() => {
      if (!container.current) {
        throw new Error('Container not rendered')
      }

      const preserveAspectRatio =
        aspectRatio(objectFit as ObjectFit),
        currentAnimationSettings = appState.multiAnimationSettings.length > 0
          ? appState.multiAnimationSettings[appState.currentAnimation]
          : undefined,
        currentAnimationManifest =
          appState.manifest?.animations[appState.currentAnimation]

      // Loop
      let hasLoop = Boolean(appState.loop)

      if (
        currentAnimationManifest?.loop !== undefined
      ) {
        hasLoop = Boolean(currentAnimationManifest.loop)
      }
      if (currentAnimationSettings?.loop !== undefined) {
        hasLoop = Boolean(currentAnimationSettings.loop)
      }

      // Autoplay
      let hasAutoplay = Boolean(appState.autoplay)

      if (
        currentAnimationManifest?.autoplay !== undefined
      ) {
        hasAutoplay = Boolean(currentAnimationManifest.autoplay)
      }
      if (currentAnimationSettings?.autoplay !== undefined) {
        hasAutoplay = Boolean(currentAnimationSettings.autoplay)
      }
      if (appState.animateOnScroll) {
        hasAutoplay = false
      }

      // Segment
      let initialSegment = appState.segment ?? undefined

      if (appState.segment?.every((val) => val > 0)) {
        initialSegment = [appState.segment[0] - 1, appState.segment[1] - 1]
      }
      if (appState.segment?.some((val) => val < 0)) {
        initialSegment = undefined
      }

      const options: AnimationConfiguration<
        RendererType.SVG | RendererType.Canvas | RendererType.HTML
      > = {
        autoplay: hasAutoplay,
        container: container.current,
        initialSegment,
        loop: hasLoop,
        renderer,
        rendererSettings: { imagePreserveAspectRatio: preserveAspectRatio },
      }

      switch (renderer) {
        case RendererType.SVG: {
          options.rendererSettings = {
            ...options.rendererSettings,
            hideOnTransparent: true,
            preserveAspectRatio,
            progressiveLoad: true,
          }
          break
        }
        case RendererType.Canvas: {
          options.rendererSettings = {
            ...options.rendererSettings,
            // @ts-expect-error TODO:
            clearCanvas: true,
            preserveAspectRatio,
            progressiveLoad: true,
          }
          break
        }
        case RendererType.HTML: {
          options.rendererSettings = {
            ...options.rendererSettings,
            hideOnTransparent: true,
          }
        }
      }

      return options
    }, [appState.animateOnScroll,
      appState.autoplay,
      appState.currentAnimation,
      appState.loop,
      appState.manifest?.animations,
      appState.multiAnimationSettings,
      appState.segment,
      objectFit,
      renderer]),

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
     * Pause.
     */
    pause = useCallback(() => {
      if (!animationItem.current) {
        return
      }

      animationItem.current.pause()
      dispatchEvent(new CustomEvent(PlayerEvents.Pause))
      setAppState(prev => ({
        ...prev,
        playerState: PlayerState.Paused,
        prevState: prev.playerState
      }))
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
          prevState: prev.playerState
        }
      })
    },

    /**
     * Seek to a given frame.
     *
     * @param value - Frame to seek to.
     */
    seek = useCallback((value: number | string) => {
      if (!animationItem.current) {
        return
      }

      // Extract frame number from either number or percentage value
      const matches = value.toString().match(/^(\d+)(%?)$/)

      if (!matches) {
        return
      }

      // Calculate and set the frame number
      const frame = Math.round(matches[2] === '%'
        ? animationItem.current.totalFrames * Number(matches[1]) / 100
        : Number(matches[1]))

      // Set seeker to new frame number
      setState(prev => {
        return {
          ...prev,
          seeker: frame
        }
      })

      // Send lottie player to the new frame
      if (
        appState.playerState === PlayerState.Playing ||
        appState.playerState === PlayerState.Frozen &&
        appState.prevState === PlayerState.Playing
      ) {
        animationItem.current.goToAndPlay(frame, true)
        setState(prev => {
          return {
            ...prev,
            playerState: PlayerState.Playing
          }
        })

        return
      }
      animationItem.current.goToAndStop(frame, true)
      animationItem.current.pause()
    }, [appState.playerState, appState.prevState]),

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
      if (appState.playerState === PlayerState.Frozen && type === 'focus') {
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
    },

    switchInstance = useCallback((currentAnimation: number, isPrevious = false) => {
      // Bail early if there is not animation to play
      if (!appState.animations[currentAnimation]) {
        return
      }

      try {
        // Clear previous animation
        animationItem.current?.destroy()

        const { mode: playMode } = appState.multiAnimationSettings[currentAnimation] ?? {}

        animationItem.current = Lottie.loadAnimation({
          ...getOptions(),
          animationData: appState.animations[currentAnimation],
        })

        setAppState(prev => ({
          ...prev,
          mode: playMode ?? PlayMode.Normal,
        }))

        // Remove event listeners to new Lottie instance, and add new
        // removeEventListeners()
        // addEventListeners()

        dispatchEvent(new CustomEvent(isPrevious ? PlayerEvents.Previous : PlayerEvents.Next))

        if (
          appState.multiAnimationSettings[currentAnimation]?.autoplay ??
          appState.autoplay
        ) {
          if (appState.animateOnScroll) {
            animationItem.current.goToAndStop(0, true)

            setAppState(prev => {
              return {
                ...prev,
                playerState: PlayerState.Paused
              }
            })

            return
          }

          animationItem.current.goToAndPlay(0, true)
          setAppState(prev => {
            return {
              ...prev,
              playerState: PlayerState.Playing
            }
          })

          return
        }

        animationItem.current.goToAndStop(0, true)
        setAppState(prev => {
          return {
            ...prev,
            playerState: PlayerState.Stopped
          }
        })
      } catch (error) {
        setAppState(prev => {
          return {
            ...prev,
            playerState: PlayerState.Error
          }
        })

        setState(prev => ({
          ...prev,
          errorMessage: handleErrors(error).message,
        }))

        dispatchEvent(new CustomEvent(PlayerEvents.Error))
      }
    }, [appState.animateOnScroll,
      appState.animations,
      appState.autoplay,
      appState.multiAnimationSettings,
      getOptions,
      setAppState]),

    /**
     * Skip to previous animation.
     */
    previous = useCallback(() => {
      setAppState((prev) => {
        const currentAnimation = clamp(prev.currentAnimation - 1, 0)

        switchInstance(currentAnimation, true)

        return {
          ...prev,
          currentAnimation
        }
      })
    }, [setAppState, switchInstance]),

    /**
     * Skip to next animation.
     */
    next = useCallback(() => {
      setAppState((prev) => {
        const currentAnimation = clamp(
          prev.currentAnimation + 1, 0, prev.animations.length
        )

        switchInstance(currentAnimation)

        return {
          ...prev,
          currentAnimation
        }
      })
    }, [setAppState, switchInstance]),

    complete = () => {
      if (!animationItem.current) {
        return
      }

      if (appState.animations.length > 1) {
        if (
          appState.multiAnimationSettings[appState.currentAnimation + 1]?.autoplay
        ) {
          next()

          return
        }
        if (appState.loop && appState.currentAnimation === appState.animations.length - 1) {
          setState((prev) => {
            return {
              ...prev,
              currentAnimation: 0
            }
          })

          switchInstance(0)

          return
        }
      }

      const { currentFrame, totalFrames } = animationItem.current,
        seeker = Math.round(currentFrame / totalFrames * 100)

      setAppState(prev => {
        return {
          ...prev,
          playerState: PlayerState.Completed,
          seeker
        }
      })

      dispatchEvent(new CustomEvent(PlayerEvents.Complete, {
        detail: {
          frame: currentFrame,
          seeker,
        },
      }))
    },

    setSpeed = (value: number) => {
      animationItem.current?.setSpeed(value)
    },

    setDirection = (value: AnimationDirection) => {
      animationItem.current?.setDirection(value)
    },

    setSubframe = (value: boolean) => {
      animationItem.current?.setSubframe(value)
    },

    setCount = useCallback((value: number) => {
      setAppState(prev => ({
        ...prev,
        count: value
      }))
    }, [setAppState]),

    setMultiAnimationSettings = useCallback((settings: AnimationSettings[]) => {
      setAppState(prev => ({
        ...prev,
        multiAnimationSettings: settings
      }))
    }, [setAppState]),

    setSegment = useCallback((segment: AnimationSegment) => {
      setAppState(prev => ({
        ...prev,
        segment
      }))
    }, [setAppState]),

    load = useCallback(async (src: string | null) => {
      if (!src) {
        return
      }

      setAppState(prev => ({
        ...prev,
        src
      }))

      // Load the resource
      try {
        const {
          animations, isDotLottie, manifest
        } = await getAnimationData(src)

        if (
          !animations ||
          animations.some((animation) => !isLottie(animation))
        ) {
          throw new Error('Broken or corrupted file')
        }

        if (manifest?.animations.length === 1) {
          manifest.animations[0].autoplay = appState.autoplay
          manifest.animations[0].loop = appState.loop
        }

        setAppState((prev) => {
          let isBounce = prev.mode === PlayMode.Bounce

          if (prev.multiAnimationSettings.length > 0 && prev.multiAnimationSettings[prev.currentAnimation]?.mode) {
            isBounce =
            prev.multiAnimationSettings[prev.currentAnimation].mode as PlayMode ===
            PlayMode.Bounce
          }

          let playerState = PlayerState.Stopped

          if (
            !prev.animateOnScroll &&
            (prev.autoplay ||
              prev.multiAnimationSettings[prev.currentAnimation]?.autoplay)
          ) {
            playerState = PlayerState.Playing
          }

          return {
            ...prev,
            animations,
            isDotLottie,
            manifest: manifest ?? {
              animations: [
                {
                  autoplay: !prev.animateOnScroll && prev.autoplay,
                  direction,
                  id: createElementID(),
                  mode: prev.mode,
                  speed,
                },
              ],
            },
            mode: isBounce ? PlayMode.Bounce : PlayMode.Normal,
            playerState
          }
        })

        // Clear previous animation, if any
        animationItem.current?.destroy()
        animationItem.current = Lottie.loadAnimation({
          ...getOptions(),
          animationData: animations[appState.currentAnimation]
        })

      } catch (error) {
        setState((prev) => {
          return {
            ...prev,
            errorMessage: handleErrors(error).message,
          }
        })

        setAppState(prev => ({
          ...prev,
          playerState: PlayerState.Error
        }))

        dispatchEvent(new CustomEvent(PlayerEvents.Error))

        return
      }

      // addEventListeners()

      const _speed =
        appState.multiAnimationSettings[appState.currentAnimation]?.speed ??
        speed,
        _direction =
          appState.multiAnimationSettings[appState.currentAnimation]?.direction ??
          direction

      // Set initial playback speed and direction
      setSpeed(_speed)
      setDirection(_direction)
      setSubframe(Boolean(subframe))

      // Start playing if autoplay is enabled
      if (appState.autoplay || appState.animateOnScroll) {
        if (direction === -1) {
          seek('99%')
        }

        if (!('IntersectionObserver' in window)) {
          if (!appState.animateOnScroll) {
            play()
          }
          setState((prev) => {
            return {
              ...prev,
              isVisible: true
            }
          })
        }
      }
    }, [
      appState.animateOnScroll,
      appState.autoplay,
      appState.currentAnimation,
      appState.loop,
      appState.multiAnimationSettings,
      direction,
      getOptions,
      play,
      seek,
      setAppState,
      speed,
      subframe
    ])

  useEffect(() => {
    void load(appState.src)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  useImperativeHandle(
    ref, () => {
      return {
        addAnimation,
        convert,
        load,
        next,
        pause,
        play,
        previous,
        seek,
        setCount,
        setDirection,
        setLoop,
        setMultiAnimationSettings,
        setSegment,
        setSpeed,
        setSubframe,
        stop
      }
    }, [
      load,
      next,
      pause,
      play,
      previous,
      seek,
      setCount,
      setMultiAnimationSettings,
      setSegment,
      stop
    ]
  )

  // Event listeners.
  useEventListener(
    'enterFrame', enterFrame, { element: animationItem }
  )
  useEventListener(
    'complete', complete, { element: animationItem }
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
      {appState.controls &&
        <Controls
          animationItem={animationItem}
          container={container}
          freeze={freeze}
          next={next}
          pause={pause}
          play={play}
          previous={previous}
          seek={seek}
          setLoop={setLoop}
          stop={stop}
        />
      }
    </div>
  )
}
