'use client'
import Lottie, {
  type AnimationConfiguration,
  type AnimationDirection,
  type AnimationItem,
} from '@aarsteinmedia/lottie-web'
import {
  createElementID,
  isServer,
  PlayerEvents, PlayMode, RendererType
} from '@aarsteinmedia/lottie-web/utils'
import {
  use, useEffect, useRef, useState
} from 'react'

import Controls from '@/components/Controls'
import ErrorMessage from '@/components/ErrorMessage'
import AppContext from '@/context/AppContext'
import styles from '@/styles/player.module.css'
import {
  aspectRatio, download, frameOutput, getFilename, handleErrors, isLottie
} from '@/utils'
import { type ObjectFit, PlayerState } from '@/utils/enums'
import getAnimationData from '@/utils/getAnimationData'

// const generator = '@aarsteinmedia/dotlottie-react'

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
  renderer = RendererType.SVG,
  speed = 1,
  subframe
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
}){

  const { appState, setAppState } = use(AppContext),
    [state, setState] = useState<{
      errorMessage: string
      isVisible: boolean
      scrollTimeout: null | NodeJS.Timeout
      scrollY: number
      isLoaded: boolean
    }>({
      errorMessage: 'Unknown error',
      isLoaded: false,
      isVisible: true, // TODO: Check if this can be correct on load
      scrollTimeout: null,
      scrollY: 0
    }),
    container = useRef<HTMLElement>(null),
    intersectionObserver = useRef<IntersectionObserver>(null),
    lottieInstance = useRef<AnimationItem>(null),

    getOptions = () => {
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
      let initialSegment = appState.segment

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
    },

    /**
     * Stop.
     */
    stop = () => {
      if (!lottieInstance.current) {
        return
      }

      try {
        lottieInstance.current.stop()
        dispatchEvent(new CustomEvent(PlayerEvents.Stop))
      } finally {
        setAppState((prev) => ({
          ...prev,
          count: 0,
          playerState: PlayerState.Stopped,
          prevState: prev.playerState
        }))
      }
    },

    /**
     * Play.
     */
    play = () => {
      if (!lottieInstance.current) {
        return
      }

      try {
        lottieInstance.current.play()
        dispatchEvent(new CustomEvent(PlayerEvents.Play))
      } finally {
        setAppState(prev => {
          return {
            ...prev,
            playerState: PlayerState.Playing
          }
        })
      }
    },

    /**
     * Pause.
     */
    pause = () => {
      if (!lottieInstance.current) {
        return
      }

      try {
        lottieInstance.current.pause()
        dispatchEvent(new CustomEvent(PlayerEvents.Pause))
      } finally {
        setAppState(prev => ({
          ...prev,
          playerState: PlayerState.Paused,
          prevState: prev.playerState
        }))
      }
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
     * Freeze animation.
     * This internal state pauses animation and is used to differentiate between
     * user requested pauses and component instigated pauses.
     */
    freeze = () => {
      if (!lottieInstance.current) {
        return
      }

      try {
        lottieInstance.current.pause()
        dispatchEvent(new CustomEvent(PlayerEvents.Freeze))
      } finally {
        setAppState(prev => {
          return {
            ...prev,
            playerState: PlayerState.Frozen,
            prevState: prev.playerState
          }
        })
      }
    },

    /**
     * Seek to a given frame.
     *
     * @param value - Frame to seek to.
     */
    seek = (value: number | string) => {
      if (!lottieInstance.current) {
        return
      }

      // Extract frame number from either number or percentage value
      const matches = value.toString().match(/^(\d+)(%?)$/)

      if (!matches) {
        return
      }

      // Calculate and set the frame number
      const frame = Math.round(matches[2] === '%'
        ? lottieInstance.current.totalFrames * Number(matches[1]) / 100
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
        lottieInstance.current.goToAndPlay(frame, true)
        setState(prev => {
          return {
            ...prev,
            playerState: PlayerState.Playing
          }
        })

        return
      }
      lottieInstance.current.goToAndStop(frame, true)
      lottieInstance.current.pause()
    },

    /**
     * Set loop.
     */
    setLoop = (value: boolean) => {
      lottieInstance.current?.setLoop(value)
    },

    loopComplete = () => {
      if (!lottieInstance.current) {
        return
      }

      const {
          playDirection,
          // firstFrame,
          totalFrames,
        } = lottieInstance.current,
        inPoint = appState.segment ? appState.segment[0] : 0,
        outPoint = appState.segment ? appState.segment[0] : totalFrames

      if (appState.count) {
        if (appState.isBounce) {
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

      if (appState.isBounce) {
        lottieInstance.current.goToAndStop(playDirection === -1 ? inPoint : outPoint * 0.99,
          true)

        lottieInstance.current.setDirection((playDirection * -1) as AnimationDirection)

        return setTimeout(() => {
          if (!appState.animateOnScroll) {
            lottieInstance.current?.play()
          }
        }, intermission)
      }

      lottieInstance.current.goToAndStop(playDirection === -1 ? outPoint * 0.99 : inPoint,
        true)

      return setTimeout(() => {
        if (!appState.animateOnScroll) {
          lottieInstance.current?.play()
        }
      }, intermission)
    },

    enterFrame = () => {
      if (!lottieInstance.current) {
        return
      }
      const { currentFrame, totalFrames } = lottieInstance.current,
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
      if (!appState.animateOnScroll || !lottieInstance.current) {
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
            lottieInstance.current.totalFrames * 3),
          roundedScroll = clampedScroll / 3

        requestAnimationFrame(() => {
          if (roundedScroll < (lottieInstance.current?.totalFrames ?? 0)) {
            setAppState(prev => {
              return {
                ...prev,
                playerState: PlayerState.Playing
              }
            })
            lottieInstance.current?.goToAndStop(roundedScroll, true)
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

    /**
     * Toggle event listeners.
     */
    toggleEventListeners = (action: 'add' | 'remove') => {
      const method = action === 'add' ? 'addEventListener' : 'removeEventListener'

      if (lottieInstance.current) {
        lottieInstance.current[method]('enterFrame', enterFrame)
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        lottieInstance.current[method]('complete', complete)
        lottieInstance.current[method]('loopComplete', loopComplete)
        lottieInstance.current[method]('DOMLoaded', domLoaded)
        lottieInstance.current[method]('data_ready', dataReady)
        lottieInstance.current[method]('data_failed', dataFailed)
      }

      if (container.current && hover) {
        container.current[method]('mouseenter', mouseEnter)
        container.current[method]('mouseleave', mouseLeave)
      }

      window[method](
        'focus', handleWindowBlur as EventListener, {
          capture: false,
          passive: true,
        }
      )
      window[method](
        'blur', handleWindowBlur as EventListener, {
          capture: false,
          passive: true,
        }
      )

      if (appState.animateOnScroll) {
        window[method](
          'scroll', handleScroll, {
            capture: true,
            passive: true,
          }
        )
      }
    },

    /**
     * Add event listeners.
     */
    addEventListeners = () => {
      toggleEventListeners('add')
    },

    /**
     * Remove event listeners.
     */
    removeEventListeners = () => {
      toggleEventListeners('remove')
    },

    switchInstance = (isPrevious = false) => {
      // Bail early if there is not animation to play
      if (!appState.animations[appState.currentAnimation]) {
        return
      }

      try {
        // Clear previous animation
        lottieInstance.current?.destroy()

        const { mode: playMode } = appState.multiAnimationSettings[appState.currentAnimation]

        lottieInstance.current = Lottie.loadAnimation({
          ...getOptions(),
          animationData: appState.animations[appState.currentAnimation],
        })

        setAppState(prev => ({
          ...prev,
          isBounce: playMode && playMode as PlayMode === PlayMode.Bounce,
        }))

        // Remove event listeners to new Lottie instance, and add new
        removeEventListeners()
        addEventListeners()

        dispatchEvent(new CustomEvent(isPrevious ? PlayerEvents.Previous : PlayerEvents.Next))

        if (
          appState.multiAnimationSettings[appState.currentAnimation]?.autoplay ??
          appState.autoplay
        ) {
          if (appState.animateOnScroll) {
            lottieInstance.current.goToAndStop(0, true)

            setAppState(prev => {
              return {
                ...prev,
                playerState: PlayerState.Paused
              }
            })

            return
          }

          lottieInstance.current.goToAndPlay(0, true)
          setAppState(prev => {
            return {
              ...prev,
              playerState: PlayerState.Playing
            }
          })

          return
        }

        lottieInstance.current.goToAndStop(0, true)
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
    },

    /**
     * Skip to next animation.
     */
    next = () => {
      setAppState((prev) => {
        return {
          ...prev,
          currentAnimation: prev.currentAnimation + 1
        }
      })
      switchInstance()
    },

    complete = () => {
      if (!lottieInstance.current) {
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

          switchInstance()

          return
        }
      }

      const { currentFrame, totalFrames } = lottieInstance.current,
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

    /**
     * Add IntersectionObserver.
     */
    addIntersectionObserver = () => {
      if (
        !container.current ||
        intersectionObserver.current ||
        !('IntersectionObserver' in window)
      ) {
        return
      }

      intersectionObserver.current = new IntersectionObserver((entries) => {
        const { length } = entries

        for (let i = 0; i < length; i++) {
          if (!entries[i].isIntersecting || document.hidden) {
            if (appState.playerState === PlayerState.Playing) {
              freeze()
            }
            setState(prev => ({
              ...prev,
              isVisible: false
            }))
            continue
          }
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
        }
      })

      intersectionObserver.current.observe(container.current)

    },

    /**
     * Animation play direction.
     *
     * @param value - Animation direction.
     */
    setDirection = (value: AnimationDirection) => {
      lottieInstance.current?.setDirection(value)
    },

    /**
     * Toggle playing state.
     */
    togglePlay = () => {
      if (!lottieInstance.current) {
        return
      }

      const {
        currentFrame, playDirection, totalFrames
      } = lottieInstance.current

      if (appState.playerState === PlayerState.Playing) {
        pause()

        return
      }
      if (appState.playerState !== PlayerState.Completed) {
        play()

        return
      }
      setAppState(prev => ({
        ...prev,
        playerState: PlayerState.Playing
      }))
      if (appState.isBounce) {
        setDirection((playDirection * -1) as AnimationDirection)

        lottieInstance.current.goToAndPlay(currentFrame, true)

        return
      }
      if (playDirection === -1) {
        lottieInstance.current.goToAndPlay(totalFrames, true)

        return
      }

      lottieInstance.current.goToAndPlay(0, true)
    },

    /**
     * Handles click and drag actions on the progress track.
     */
    handleSeekChange = ({ target }: React.ChangeEvent) => {
      if (
        !(target instanceof HTMLInputElement) ||
        !lottieInstance.current ||
        isNaN(Number(target.value))
      ) {
        return
      }

      seek(Math.round(Number(target.value) / 100 * lottieInstance.current.totalFrames))
    },

    /**
     * Snapshot and download the current frame as SVG.
     */
    snapshot = (shouldDownload = true, name = 'AM Lottie') => {
      try {
        if (!container.current) {
          throw new Error('Unknown error')
        }

        // Get SVG element and serialize markup
        const svgElement = container.current.querySelector('figure svg')

        if (!svgElement) {
          throw new Error('Could not retrieve animation from DOM')
        }

        const data =
          svgElement instanceof Node
            ? new XMLSerializer().serializeToString(svgElement)
            : null

        if (!data) {
          throw new Error('Could not serialize SVG element')
        }

        if (shouldDownload) {
          download(data, {
            mimeType: 'image/svg+xml',
            name: `${getFilename(appState.src || name)}-${frameOutput(appState.seeker)}.svg`,
          })
        }

        return data
      } catch (error) {
        console.error(error)

        return null
      }
    },

    /**
     * Toggle loop.
     */
    toggleLoop = () => {
      const hasLoop = !appState.loop

      setAppState(prev => ({
        ...prev,
        loop: hasLoop
      }))
      setLoop(hasLoop)
    },

    load = async (src: string | null) => {
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
            isBounce,
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
            playerState
          }
        })

        // Clear previous animation, if any
        lottieInstance.current?.destroy()
        lottieInstance.current = Lottie.loadAnimation({
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

      addEventListeners()

      const _speed =
        appState.multiAnimationSettings[appState.currentAnimation]?.speed ??
        speed,
        _direction =
          appState.multiAnimationSettings[appState.currentAnimation]?.direction ??
          direction

      // Set initial playback speed and direction
      lottieInstance.current.setSpeed(_speed)
      lottieInstance.current.setDirection(_direction)
      lottieInstance.current.setSubframe(Boolean(subframe))

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

        addIntersectionObserver()
      }
    }

  // eslint-disable-next-line react-you-might-not-need-an-effect/you-might-not-need-an-effect
  useEffect(() => {
    // eslint-disable-next-line react-you-might-not-need-an-effect/you-might-not-need-an-effect
    void load(appState.src)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={styles.dotLottie}
      lang={appState.lang}
      aria-label={description}
      data-controls={appState.controls}
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
          freeze={freeze}
          handleSeekChange={handleSeekChange}
          snapshot={snapshot}
          stop={stop}
          toggleLoop={toggleLoop}
          togglePlay={togglePlay}
        />
      }
    </div>
  )
}
