'use client'

import Lottie, {
  type AnimationConfiguration,
  type AnimationData,
  type AnimationDirection,
  type AnimationItem,
  type AnimationSettings,
  type LottieManifest,
  type Vector2,
} from '@aarsteinmedia/lottie-web'
import {
  createElementID, isServer, namespaceSVG, PlayerEvents, PlayMode, PreserveAspectRatio, RendererType
} from '@aarsteinmedia/lottie-web/utils'
import {
  use, useEffect, useRef, useState
} from 'react'

import type {
  AnimateOnScroll,
  AnimationAttributes,
  Autoplay,
  Controls,
  ConvertParams,
  Loop,
  Subframe,
} from '@/types'

import AppContext from '@/context/AppContext'
import styles from '@/styles.module.css'
import renderControls from '@/templates/controls'
import renderPlayer from '@/templates/player'
import {
  aspectRatio,
  download,
  frameOutput,
  getFilename,
  handleErrors
} from '@/utils'
import createDotLottie from '@/utils/createDotLottie'
import createJSON from '@/utils/createJSON'
import {
  type ObjectFit,
  PlayerState,
} from '@/utils/enums'
import getAnimationData from '@/utils/getAnimationData'

const generator = '@aarsteinmedia/dotlottie-react'

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
  mode = PlayMode.Normal,
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
  mode?: PlayMode,
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  renderer?: RendererType
  speed?: number,
  subframe?: boolean
}){

  const { appState, setAppState } = use(AppContext)

  const [state, setState] = useState<{
      animations: AnimationData[]
      errorMessage: string
      count: number
      isLoaded: boolean
      lang: string
      scrollTimeout: null | NodeJS.Timeout
      scrollY: number
      isVisible: boolean
      playerState: PlayerState
      prevState: PlayerState
      isSettingsOpen: boolean
      seeker: number
      currentAnimation: number
      animation: number
      intersectionObserver: null | IntersectionObserver,
      isBounce: boolean
      isDotLottie: boolean
      lottieInstance: null | AnimationItem
      manifest: null | LottieManifest
      multiAnimationSettings: AnimationSettings[]
      segment?: Vector2
    }>(() => { return {
      animation: 0,
      animations: [],
      count: 0,
      currentAnimation: 0,
      errorMessage: 'Something went wrong',
      intersectionObserver: null,
      isBounce: false,
      isDotLottie: false,
      isLoaded: false,
      isSettingsOpen: false,
      isVisible: false,
      lang: document.documentElement.lang,
      lottieInstance: null,
      manifest: null,
      multiAnimationSettings: [],
      playerState: PlayerState.Loading,
      prevState: PlayerState.Loading,
      scrollTimeout: null,
      scrollY: 0,
      seeker: 0,
    } }),
    container = useRef<HTMLElement>(null)

  /**
   * Runs when the value of an attribute is changed on the component.
   */
  // async attributeChangedCallback(
  //   name: string,
  //   _oldValue: unknown,
  //   value: string
  // ) {
  //   if (!this._lottieInstance || !this.shadow) {
  //     return
  //   }

  //   if (name === 'animateOnScroll') {
  //     if (value === '' || Boolean(value)) {
  //       this._lottieInstance.autoplay = false
  //       addEventListener(
  //         'scroll', this._handleScroll, {
  //           capture: true,
  //           passive: true,
  //         }
  //       )

  //       return
  //     }
  //     removeEventListener(
  //       'scroll', this._handleScroll, true
  //     )
  //   }

  //   if (name === 'autoplay') {
  //     if (this.animateOnScroll) {
  //       return
  //     }
  //     if (value === '' || Boolean(value)) {
  //       this.play()

  //       return
  //     }
  //     this.stop()
  //   }

  //   if (name === 'controls') {
  //     this._renderControls()
  //   }

  //   if (name === 'direction') {
  //     if (Number(value) === -1) {
  //       this.setDirection(-1)

  //       return
  //     }
  //     this.setDirection(1)
  //   }

  //   if (name === 'hover' && this._container) {
  //     if (value === '' || Boolean(value)) {
  //       this._container.addEventListener('mouseenter', this._mouseEnter)
  //       this._container.addEventListener('mouseleave', this._mouseLeave)

  //       return
  //     }
  //     this._container.removeEventListener('mouseenter', this._mouseEnter)
  //     this._container.removeEventListener('mouseleave', this._mouseLeave)
  //   }

  //   if (name === 'loop') {
  //     const toggleLoop = this.shadow.querySelector('.toggleLoop')

  //     if (toggleLoop instanceof HTMLButtonElement) {
  //       toggleLoop.dataset.active = value
  //     }
  //     this.setLoop(value === '' || Boolean(value))
  //   }

  //   if (name === 'mode') {
  //     const toggleBoomerang = this.shadow.querySelector('.toggleBoomerang')

  //     if (toggleBoomerang instanceof HTMLButtonElement) {
  //       toggleBoomerang.dataset.active = (value as PlayMode === PlayMode.Bounce).toString()
  //     }
  //     this._isBounce = value as PlayMode === PlayMode.Bounce
  //   }

  //   if (name === 'speed') {
  //     const val = Number(value)

  //     if (val && !isNaN(val)) {
  //       this.setSpeed(val)
  //     }
  //   }

  //   if (name === 'src') {
  //     await this.load(value)
  //   }

  //   if (name === 'subframe') {
  //     this.setSubframe(value === '' || Boolean(value))
  //   }
  // }

  /**
   * Initialize everything on component first render.
   */
  useEffect(() => {
    // await renderPlayer()


    // this._renderControls()

    // Add listener for Visibility API's change event.
    if (typeof document.hidden !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityChange)
    }

    // Add intersection observer for detecting component being out-of-view.
    addIntersectionObserver()

    // Setup lottie player
    void load(src)
    dispatchEvent(new CustomEvent(PlayerEvents.Rendered))

    return () => {
      if (state.intersectionObserver) {
        state.intersectionObserver.disconnect()
        setState((prev) => { return {
          ...prev,
          intersectionObserver: null
        } })
      }

      // Remove the attached Visibility API's change event listener
      document.removeEventListener('visibilitychange', onVisibilityChange)

      // Destroy the animation instance
      destroy()
    }
  }, [])

  /**
   * Destroy animation and element.
   */
  const destroy = () => {
    if (!state.lottieInstance?.destroy) {
      return
    }

    setState((prev) => {
      prev.lottieInstance?.destroy()

      return {
        ...prev,
        lottieInstance: null,
        playerState: PlayerState.Destroyed
      }
    })

    dispatchEvent(new CustomEvent(PlayerEvents.Destroyed))
    remove()

    document.removeEventListener('visibilitychange', onVisibilityChange)
  }

  // /**
  //  * Returns the lottie-web instance used in the component.
  //  */
  // const getLottie = () =>
  //   state.lottieInstance


  // /**
  //  * Get Lottie Manifest.
  //  */
  // const getManifest = () =>
  //   state.manifest


  // /**
  //  * Get Multi-animation settings.
  //  */
  // const getMultiAnimationSettings = () =>
  //   state.multiAnimationSettings


  // /**
  //  * Get playback segment.
  //  */
  // const getSegment = () =>
  //   state.segment


  /**
   * Initialize Lottie Web player.
   */
  const load = async (src: string | null) => {
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
        manifest.animations[0].autoplay = autoplay
        manifest.animations[0].loop = loop
      }

      setState((prev) => {
        let isBounce = mode === PlayMode.Bounce

        if (prev.multiAnimationSettings.length > 0 && prev.multiAnimationSettings[prev.currentAnimation]?.mode) {
          isBounce =
            prev.multiAnimationSettings[prev.currentAnimation].mode as PlayMode ===
            PlayMode.Bounce
        }

        let playerState = PlayerState.Stopped

        if (
          !animateOnScroll &&
          (autoplay ||
            prev.multiAnimationSettings[prev.currentAnimation]?.autoplay)
        ) {
          playerState = PlayerState.Playing
        }

        // Clear previous animation, if any
        prev.lottieInstance?.destroy()

        return {
          ...prev,
          animations,
          isBounce,
          isDotLottie,
          lottieInstance: Lottie.loadAnimation({
            ...getOptions(),
            animationData: animations[prev.currentAnimation]
          }),
          manifest: manifest ?? {
            animations: [
              {
                autoplay: !animateOnScroll && autoplay,
                direction,
                id: createElementID(),
                loop,
                mode,
                speed,
              },
            ],
          },
          playerState
        }
      })
    } catch (error) {
      setState((prev) => { return {
        ...prev,
        errorMessage: handleErrors(error).message,
        playerState: PlayerState.Error
      } })

      dispatchEvent(new CustomEvent(PlayerEvents.Error))

      return
    }

    addEventListeners()

    const _speed =
      state.multiAnimationSettings[state.currentAnimation]?.speed ??
      speed,
      _direction =
        state.multiAnimationSettings[state.currentAnimation]?.direction ??
        direction

    // Set initial playback speed and direction
    state.lottieInstance?.setSpeed(_speed)
    state.lottieInstance?.setDirection(_direction)
    state.lottieInstance?.setSubframe(Boolean(subframe))

    // Start playing if autoplay is enabled
    if (autoplay || animateOnScroll) {
      if (direction === -1) {
        seek('99%')
      }

      if (!('IntersectionObserver' in window)) {
        if (!animateOnScroll) {
          play()
        }
        setState((prev) => { return {
          ...prev,
          isVisible: true
        } })
      }

      addIntersectionObserver()
    }
  }

  const switchInstance = (isPrevious = false) => {
    // Bail early if there is not animation to play
    if (!state.animations[state.currentAnimation]) {
      return
    }

    try {
      // Clear previous animation
      state.lottieInstance?.destroy()

      setState(prev => {
        // Check play mode for current animation
        if (prev.multiAnimationSettings[prev.currentAnimation]?.mode) {
          prev.isBounce =
            prev.multiAnimationSettings[prev.currentAnimation].mode as PlayMode ===
            PlayMode.Bounce
        }

        return {
          ...prev,
          // Re-initialize lottie player
          lottieInstance: Lottie.loadAnimation({
            ...getOptions(),
            animationData: prev.animations[prev.currentAnimation],
          })
        }
      })

      // Remove event listeners to new Lottie instance, and add new
      removeEventListeners()
      addEventListeners()

      dispatchEvent(new CustomEvent(isPrevious ? PlayerEvents.Previous : PlayerEvents.Next))

      if (
        state.multiAnimationSettings[state.currentAnimation]?.autoplay ??
        autoplay
      ) {
        if (animateOnScroll) {
          state.lottieInstance?.goToAndStop(0, true)

          setState(prev => { return {
            ...prev,
            playerState: PlayerState.Paused
          } })

          return
        }

        state.lottieInstance?.goToAndPlay(0, true)
        setState(prev => { return {
          ...prev,
          playerState: PlayerState.Playing
        } })

        return
      }

      state.lottieInstance?.goToAndStop(0, true)
      setState(prev => { return {
        ...prev,
        playerState: PlayerState.Stopped
      } })
    } catch (error) {
      setState(prev => { return {
        ...prev,
        errorMessage: handleErrors(error).message,
        playerState: PlayerState.Error
      } })

      dispatchEvent(new CustomEvent(PlayerEvents.Error))
    }
  }

  /**
   * Skip to next animation.
   */
  const next = () => {
    setState((prev) => { return {
      ...prev,
      currentAnimation: prev.currentAnimation + 1
    } })
    switchInstance()
  }

  /**
   * Pause.
   */
  const pause = () => {
    if (!state.lottieInstance) {
      return
    }

    try {
      state.lottieInstance.pause()
      dispatchEvent(new CustomEvent(PlayerEvents.Pause))
    } finally {
      setState(prev => { return {
        ...prev,
        playerState: PlayerState.Paused,
        prevState: PlayerState.Playing
      } })
    }
  }

  /**
   * Play.
   */
  const play = () => {
    if (!state.lottieInstance) {
      return
    }

    try {
      state.lottieInstance.play()
      dispatchEvent(new CustomEvent(PlayerEvents.Play))
    } finally {
      setState(prev => { return {
        ...prev,
        playerState: PlayerState.Playing
      } })
    }
  }

  /**
   * Skip to previous animation.
   */
  const previous = () => {
    setState((prev) => { return {
      ...prev,
      currentAnimation: prev.currentAnimation - 1
    } })
    switchInstance(true)
  }

  /**
   * Name: string, oldValue: string, newValue: string.
   */
  // override propertyChangedCallback(
  //   name: string, _oldValue: unknown, value: unknown
  // ) {
  //   if (!this.shadow) {
  //     return
  //   }

  //   const togglePlay = this.shadow.querySelector('.togglePlay'),
  //     stop = this.shadow.querySelector('.stop'),
  //     prev = this.shadow.querySelector('.prev'),
  //     next = this.shadow.querySelector('.next'),
  //     seeker = this.shadow.querySelector('.seeker'),
  //     progress = this.shadow.querySelector('progress'),
  //     popover = this.shadow.querySelector('.popover'),
  //     convert = this.shadow.querySelector('.convert'),
  //     snapshot = this.shadow.querySelector('.snapshot')

  //   if (
  //     !(togglePlay instanceof HTMLButtonElement) ||
  //     !(stop instanceof HTMLButtonElement) ||
  //     !(next instanceof HTMLButtonElement) ||
  //     !(prev instanceof HTMLButtonElement) ||
  //     !(seeker instanceof HTMLInputElement) ||
  //     !(progress instanceof HTMLProgressElement)
  //   ) {
  //     return
  //   }

  //   if (name === 'playerState') {
  //     togglePlay.dataset.active = (
  //       value === PlayerState.Playing || value === PlayerState.Paused
  //     ).toString()
  //     stop.dataset.active = (value === PlayerState.Stopped).toString()

  //     if (value === PlayerState.Playing) {
  //       togglePlay.innerHTML = /* HTML */ `
  //         <svg width="24" height="24" aria-hidden="true" focusable="false">
  //           <path
  //             d="M14.016 5.016H18v13.969h-3.984V5.016zM6 18.984V5.015h3.984v13.969H6z"
  //           />
  //         </svg>
  //       `
  //     } else {
  //       togglePlay.innerHTML = /* HTML */ `
  //         <svg width="24" height="24" aria-hidden="true" focusable="false">
  //           <path d="M8.016 5.016L18.985 12 8.016 18.984V5.015z" />
  //         </svg>
  //       `
  //     }
  //   }

  //   if (name === '_seeker' && typeof value === 'number') {
  //     seeker.value = value.toString()
  //     seeker.ariaValueNow = value.toString()
  //     progress.value = value
  //   }

  //   if (name === '_animations' && Array.isArray(value) && this._currentAnimation + 1 < value.length) {
  //     next.hidden = false
  //   }

  //   if (name === '_currentAnimation' && typeof value === 'number') {
  //     next.hidden = value + 1 >= this._animations.length
  //     prev.hidden = !value
  //   }

  //   if (
  //     name === '_isSettingsOpen' &&
  //     typeof value === 'boolean' &&
  //     popover instanceof HTMLDivElement &&
  //     convert instanceof HTMLButtonElement &&
  //     snapshot instanceof HTMLButtonElement
  //   ) {
  //     popover.hidden = !value
  //     convert.hidden = false
  //     snapshot.hidden = this.renderer !== RendererType.SVG

  //     if (this._isDotLottie) {
  //       convert.ariaLabel = 'Convert dotLottie to JSON'
  //       convert.innerHTML = convert.innerHTML.replace('dotLottie', 'JSON')
  //     } else {
  //       convert.ariaLabel = 'Convert JSON animation to dotLottie format'
  //       convert.innerHTML = convert.innerHTML.replace('JSON', 'dotLottie')
  //     }
  //   }
  // }

  /**
   * Reload animation.
   */
  export const reload = async () => {
    if (!state.lottieInstance || !source.current) {
      return
    }

    state.lottieInstance.destroy()

    await load(source.current)
  }

  /**
   * Seek to a given frame.
   *
   * @param value - Frame to seek to.
   */
  const seek = (value: number | string) => {
    if (!state.lottieInstance) {
      return
    }

    // Extract frame number from either number or percentage value
    const matches = value.toString().match(/^(\d+)(%?)$/)

    if (!matches) {
      return
    }

    // Calculate and set the frame number
    const frame = Math.round(matches[2] === '%'
      ? state.lottieInstance.totalFrames * Number(matches[1]) / 100
      : Number(matches[1]))

    // Set seeker to new frame number
    setState(prev => { return {
      ...prev,
      seeker: frame
    } })

    // Send lottie player to the new frame
    if (
      state.playerState === PlayerState.Playing ||
      state.playerState === PlayerState.Frozen &&
      state.prevState === PlayerState.Playing
    ) {
      state.lottieInstance.goToAndPlay(frame, true)
      setState(prev => { return {
        ...prev,
        playerState: PlayerState.Playing
      } })

      return
    }
    state.lottieInstance.goToAndStop(frame, true)
    state.lottieInstance.pause()
  }

  /**
   * Dynamically set count for loops.
   */
  const setCount = (value: number) => {
    setState(prev => { return {
      ...prev,
      count: value
    } })
  }

  /**
   * Animation play direction.
   *
   * @param value - Animation direction.
   */
  export const setDirection =(value: AnimationDirection) => {
    if (!state.lottieInstance) {
      return
    }
    state.lottieInstance.setDirection(value)
  }

  /**
   * Set loop.
   *
   */
  const setLoop = (value: boolean) => {
    if (!state.lottieInstance) {
      return
    }
    state.lottieInstance.setLoop(value)
  }

  /**
   * Set Multi-animation settings.
   *
   */
  const setMultiAnimationSettings = (settings: AnimationSettings[]) => {
    setState(prev => { return {
      ...prev,
      multiAnimationSettings: settings
    } })
  }

  /**
   * Set playback segment.
   *
   */
  export const setSegment = (segment: Vector2) => {
    setState(prev => { return {
      ...prev,
      segment
    } })
  }

  /**
   * Set animation playback speed.
   *
   * @param value - Playback speed.
   */
  const setSpeed = (value = 1) => {
    if (!state.lottieInstance) {
      return
    }
    state.lottieInstance.setSpeed(value)
  }

  /**
   * Toggles subframe, for more smooth animations.
   *
   * @param value - Whether animation uses subframe.
   */
  const setSubframe = (value: boolean) => {
    if (!state.lottieInstance) {
      return
    }
    state.lottieInstance.setSubframe(value)
  }

  /**
   * Snapshot and download the current frame as SVG.
   */
  const snapshot = (shouldDownload = true, name = 'AM Lottie') => {
    try {
      // Get SVG element and serialize markup
      const svgElement = this.shadowRoot.querySelector('.animation svg')

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
          name: `${getFilename(source.current || name)}-${frameOutput(state.seeker)}.svg`,
        })
      }

      return data
    } catch (error) {
      console.error(error)

      return null
    }
  }

  /**
   * Stop.
   */
  const stop = () => {
    if (!state.lottieInstance) {
      return
    }

    try {
      setState(prev => { return {
        ...prev,
        count: 0,
        prevState: prev.playerState
      } })
      state.lottieInstance.stop()
      dispatchEvent(new CustomEvent(PlayerEvents.Stop))
    } finally {
      setState(prev => { return {
        ...prev,
        playerState: PlayerState.Stopped
      } })
    }
  }

  /**
   * Toggle Boomerang.
   */
  const toggleBoomerang = () => {
    const curr = state.multiAnimationSettings[state.currentAnimation]

    if (curr.mode !== undefined) {
      if (curr.mode as PlayMode === PlayMode.Normal) {
        curr.mode = PlayMode.Bounce
        setState(prev => { return {
          ...prev,
          isBounce: true
        } })

        return
      }
      curr.mode = PlayMode.Normal
      setState(prev => { return {
        ...prev,
        isBounce: false
      } })

      return
    }

    if (mode === PlayMode.Normal) {
      this.mode = PlayMode.Bounce
      this._isBounce = true

      return
    }

    this.mode = PlayMode.Normal
    this._isBounce = false
  }

  /**
   * Toggle loop.
   */
  const toggleLoop = () => {
    const hasLoop = !loop

    // this.loop = hasLoop
    setLoop(hasLoop)
  }

  /**
   * Toggle playing state.
   */
  const togglePlay = () => {
    if (!state.lottieInstance) {
      return
    }

    const {
      currentFrame, playDirection, totalFrames
    } = state.lottieInstance

    if (state.playerState === PlayerState.Playing) {
      pause()

      return
    }
    if (state.playerState !== PlayerState.Completed) {
      play()

      return
    }
    setState(prev => { return {
      ...prev,
      playerState: PlayerState.Playing
    } })
    if (state.isBounce) {
      setDirection((playDirection * -1) as AnimationDirection)

      state.lottieInstance.goToAndPlay(currentFrame, true)

      return
    }
    if (playDirection === -1) {
      state.lottieInstance.goToAndPlay(totalFrames, true)

      return
    }

    state.lottieInstance.goToAndPlay(0, true)
  }

  /**
   * Freeze animation.
   * This internal state pauses animation and is used to differentiate between
   * user requested pauses and component instigated pauses.
   */
  const freeze = () => {
    if (!state.lottieInstance) {
      return
    }

    setState(prev => { return {
      ...prev,
      prevState: prev.playerState
    } })

    try {
      state.lottieInstance.pause()
      dispatchEvent(new CustomEvent(PlayerEvents.Freeze))
    } finally {
      setState(prev => { return {
        ...prev,
        playerState: PlayerState.Frozen
      } })
    }
  }

  /**
   * Handle blur.
   */
  const handleBlur = () => {
    setTimeout(() => { toggleSettings(false) }, 200)
  }

  /**
   * Handles click and drag actions on the progress track.
   *
   */
  const handleSeekChange = ({ target }: Event) => {
    if (
      !(target instanceof HTMLInputElement) ||
      !state.lottieInstance ||
      isNaN(Number(target.value))
    ) {
      return
    }

    seek(Math.round(Number(target.value) / 100 * state.lottieInstance.totalFrames))
  }

  /**
   * Toggle event listeners.
   */
  const toggleEventListeners = (action: 'add' | 'remove') => {
    const method = action === 'add' ? 'addEventListener' : 'removeEventListener'

    if (state.lottieInstance) {
      state.lottieInstance[method]('enterFrame', enterFrame)
      state.lottieInstance[method]('complete', complete)
      state.lottieInstance[method]('loopComplete', loopComplete)
      state.lottieInstance[method]('DOMLoaded', domLoaded)
      state.lottieInstance[method]('data_ready', dataReady)
      state.lottieInstance[method]('data_failed', dataFailed)
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

    if (animateOnScroll) {
      window[method](
        'scroll', handleScroll, {
          capture: true,
          passive: true,
        }
      )
    }
  }

  /**
   * Handle settings click event.
   */
  const handleSettingsClick = ({ target }: Event) => {
    toggleSettings()
    // Because Safari does not add focus on click, we need to add it manually, so the onblur event will fire
    if (target instanceof HTMLElement) {
      target.focus()
    }
  }

  /**
   * Add event listeners.
   */
  const addEventListeners = () => {
    toggleEventListeners('add')
  }

  /**
   * Add IntersectionObserver.
   */
  const addIntersectionObserver = () => {
    setState(prev => {
      if (
        !container.current ||
        state.intersectionObserver ||
        !('IntersectionObserver' in window)
      ) {
        return prev
      }

      const intersectionObserver = new IntersectionObserver((entries) => {
        const { length } = entries

        for (let i = 0; i < length; i++) {
          if (!entries[i].isIntersecting || document.hidden) {
            if (prev.playerState === PlayerState.Playing) {
              freeze()
            }
            prev.isVisible = false
            continue
          }
          if (!animateOnScroll && prev.playerState === PlayerState.Frozen) {
            play()
          }
          if (!prev.scrollY) {
            prev.scrollY = scrollY
          }
          prev.isVisible = true
        }
      })

      intersectionObserver.observe(container.current)

      return {
        ...prev,
        intersectionObserver
      }})
  }

  const complete = () => {
    if (!state.lottieInstance) {
      return
    }

    if (state.animations.length > 1) {
      if (
        state.multiAnimationSettings[state.currentAnimation + 1]?.autoplay
      ) {
        next()

        return
      }
      if (loop && state.currentAnimation === state.animations.length - 1) {
        setState((prev) => { return {
          ...prev,
          currentAnimation: 0
        } })

        switchInstance()

        return
      }
    }

    const { currentFrame, totalFrames } = state.lottieInstance

    setState(prev => { return {
      ...prev,
      playerState: PlayerState.Completed,
      seeker: Math.round(currentFrame / totalFrames * 100)
    } })

    dispatchEvent(new CustomEvent(PlayerEvents.Complete, {
      detail: {
        frame: currentFrame,
        seeker: state.seeker,
      },
    }))
  }

  const dataFailed = () => {
    setState(prev => { return {
      ...prev,
      playerState: PlayerState.Error
    } })
    dispatchEvent(new CustomEvent(PlayerEvents.Error))
  }

  const domLoaded = () => {
    setState(prev => { return {
      ...prev,
      isLoaded: true
    } })
    dispatchEvent(new CustomEvent(PlayerEvents.Ready))
  }

  const enterFrame = () => {
    if (!state.lottieInstance) {
      return
    }
    const { currentFrame, totalFrames } = state.lottieInstance

    setState(prev => { return {
      ...prev,
      seeker: Math.round(currentFrame / totalFrames * 100)
    } })

    dispatchEvent(new CustomEvent(PlayerEvents.Frame, {
      detail: {
        frame: currentFrame,
        seeker: state.seeker,
      },
    }))
  }

  /**
   * Handle scroll.
   */
  const handleScroll = () => {
    if (!animateOnScroll || !state.lottieInstance) {
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
        setState(prev => { return {
          ...prev,
          playerState: PlayerState.Paused
        } })
      }, 400)

      const adjustedScroll =
        scrollY > state.scrollY
          ? scrollY - state.scrollY
          : state.scrollY - scrollY,
        clampedScroll = Math.min(Math.max(adjustedScroll / 3, 1),
          state.lottieInstance.totalFrames * 3),
        roundedScroll = clampedScroll / 3

      requestAnimationFrame(() => {
        if (roundedScroll < (state.lottieInstance?.totalFrames ?? 0)) {
          setState(prev => { return {
            ...prev,
            playerState: PlayerState.Playing
          } })
          state.lottieInstance?.goToAndStop(roundedScroll, true)
        } else {
          setState(prev => { return {
            ...prev,
            playerState: PlayerState.Paused
          } })
        }
      })
    }
  }

  const handleWindowBlur = ({ type }: FocusEvent) => {
    if (state.playerState === PlayerState.Playing && type === 'blur') {
      freeze()
    }
    if (state.playerState === PlayerState.Frozen && type === 'focus') {
      play()
    }
  }

  const loopComplete = () => {
    if (!state.lottieInstance) {
      return
    }

    const {
        playDirection,
        // firstFrame,
        totalFrames,
      } = state.lottieInstance,
      inPoint = state.segment ? state.segment[0] : 0,
      outPoint = state.segment ? state.segment[0] : totalFrames

    setState(prev => {
      if (prev.count) {
        if (prev.isBounce) {
          prev.count = prev.count + 0.5
        } else {
          prev.count = prev.count + 1
        }

        if (prev.count >= count) {
          setLoop(false)

          prev.playerState = PlayerState.Completed

          dispatchEvent(new CustomEvent(PlayerEvents.Complete))

          return prev
        }
      }

      dispatchEvent(new CustomEvent(PlayerEvents.Loop))

      if (prev.isBounce) {
        prev.lottieInstance?.goToAndStop(playDirection === -1 ? inPoint : outPoint * 0.99,
          true)

        prev.lottieInstance?.setDirection((playDirection * -1) as AnimationDirection)

        setTimeout(() => {
          if (!animateOnScroll) {
            prev.lottieInstance?.play()
          }
        }, intermission)

        return prev
      }

      prev.lottieInstance?.goToAndStop(playDirection === -1 ? outPoint * 0.99 : inPoint,
        true)

      setTimeout(() => {
        if (!animateOnScroll) {
          prev.lottieInstance?.play()
        }
      }, intermission)

      return prev
    })
  }

  /**
   * Handle MouseEnter.
   */
  const mouseEnter = () => {
    if (hover && state.playerState !== PlayerState.Playing) {
      play()
    }
  }

  /**
   * Handle MouseLeave.
   */
  const mouseLeave = () => {
    if (hover && state.playerState === PlayerState.Playing) {
      stop()
    }
  }

  /**
   * Handle visibility change events.
   */
  const onVisibilityChange = () => {
    if (document.hidden && state.playerState === PlayerState.Playing) {
      freeze()

      return
    }

    if (state.playerState === PlayerState.Frozen) {
      play()
    }
  }

  /**
   * Remove event listeners.
   */
  const removeEventListeners = () => {
    toggleEventListeners('remove')
  }

  /**
   * Toggle show Settings.
   */
  const toggleSettings = (flag?: boolean) => {
    if (flag === undefined) {
      setState(prev => { return {
        ...prev,
        isSettingsOpen: !prev.isSettingsOpen
      } })

      return
    }

    setState(prev => { return {
      ...prev,
      isSettingsOpen: flag
    } })
  }

  return (
    <div className={styles.dotLottie} lang={state.lang} aria-label={description}>
      <figure className={styles.animation} style={{ background }}>
        {state.playerState === PlayerState.Error &&
          <div className={styles.error}>
            <svg
              preserveAspectRatio={PreserveAspectRatio.Cover}
              xmlns={namespaceSVG}
              width="1920"
              height="1080"
              viewBox="0 0 1920 1080"
              style={{ whiteSpace: 'preserve' }}
            >
              <path fill="#fff" d="M0 0h1920v1080H0z" />
              <path
                fill="#3a6d8b"
                d="M1190.2 531 1007 212.4c-22-38.2-77.2-38-98.8.5L729.5 531.3c-21.3 37.9 6.1 84.6 49.5 84.6l361.9.3c43.7 0 71.1-47.3 49.3-85.2zM937.3 288.7c.2-7.5 3.3-23.9 23.2-23.9 16.3 0 23 16.1 23 23.5 0 55.3-10.7 197.2-12.2 214.5-.1 1-.9 1.7-1.9 1.7h-18.3c-1 0-1.8-.7-1.9-1.7-1.4-17.5-13.4-162.9-11.9-214.1zm24.2 283.8c-13.1 0-23.7-10.6-23.7-23.7s10.6-23.7 23.7-23.7 23.7 10.6 23.7 23.7-10.6 23.7-23.7 23.7zM722.1 644h112.6v34.4h-70.4V698h58.8v31.7h-58.8v22.6h72.4v36.2H722.1V644zm162 57.1h.6c8.3-12.9 18.2-17.8 31.3-17.8 3 0 5.1.4 6.3 1v32.6h-.8c-22.4-3.8-35.6 6.3-35.6 29.5v42.3h-38.2V685.5h36.4v15.6zm78.9 0h.6c8.3-12.9 18.2-17.8 31.3-17.8 3 0 5.1.4 6.3 1v32.6h-.8c-22.4-3.8-35.6 6.3-35.6 29.5v42.3h-38.2V685.5H963v15.6zm39.5 36.2c0-31.3 22.2-54.8 56.6-54.8 34.4 0 56.2 23.5 56.2 54.8s-21.8 54.6-56.2 54.6c-34.4-.1-56.6-23.3-56.6-54.6zm74 0c0-17.4-6.1-29.1-17.8-29.1-11.7 0-17.4 11.7-17.4 29.1 0 17.4 5.7 29.1 17.4 29.1s17.8-11.8 17.8-29.1zm83.1-36.2h.6c8.3-12.9 18.2-17.8 31.3-17.8 3 0 5.1.4 6.3 1v32.6h-.8c-22.4-3.8-35.6 6.3-35.6 29.5v42.3h-38.2V685.5h36.4v15.6z"
              />
              <path fill="none" d="M718.9 807.7h645v285.4h-645z" />
              <text
                fill="#3a6d8b"
                x="50%"
                y="848.017"
                textAnchor="middle"
                style={{
                  fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,\'.SFNSText-Regular\',sans-serif',
                  fontSize: '47px',
                  left: '100%',
                  position: 'absolute',
                  textAlign: 'center'
                }}
              >
                {state.errorMessage}
              </text>
            </svg>
          </div>
        }
      </figure>
    </div>
  )
}
