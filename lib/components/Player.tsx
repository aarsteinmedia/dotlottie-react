import type {
  AnimationConfiguration,
  AnimationDirection,
  AnimationItem,
  AnimationSegment,
  AnimationSettings,
} from '@aarsteinmedia/lottie-web'

import {
  clamp,
  RendererType
} from '@aarsteinmedia/lottie-web/utils'
import {
  lazy,
  Suspense,
  useCallback, useEffect, useImperativeHandle, useRef
} from 'react'

import type { DotLottieMethods } from '@/types'

import useApp from '@/hooks/useApp'
import { useGlobalEvents } from '@/hooks/useGlobalEvents'
import { useLottieInstance } from '@/hooks/useLottieInstance'
import { usePlayback } from '@/hooks/usePlayback'
import { usePlayerEvents } from '@/hooks/usePlayerEvents'
import styles from '@/styles/player.module.css'
import { classnames } from '@/utils'
import { ObjectFit, PlayerState } from '@/utils/enums'
import { getDotLottieModule } from '@/utils/getDotLottieModule'

const Controls = lazy(() => import('@/components/Controls')),
  ErrorMessage = lazy(() => import('@/components/ErrorMessage'))

/**
 * DotLottie Player.
 */
interface Props {
  background?: string
  className?: string
  count?: number
  description?: string
  direction?: AnimationDirection,
  hover?: boolean
  intermission?: number
  loadAnimation: (params: AnimationConfiguration) => AnimationItem
  objectFit?: ObjectFit
  onComplete?: () => void
  onError?: () => void
  onLoad?: () => void
  ref?: React.RefObject<DotLottieMethods | null>
  renderer?: RendererType
  speed?: number,
  subframe?: boolean
}
export default function Player({
  background,
  className = '',
  count = 0,
  description,
  direction = 1,
  hover,
  intermission,
  loadAnimation,
  objectFit = ObjectFit.Contain,
  onComplete,
  onError: onLoadError,
  onLoad,
  ref,
  renderer = RendererType.SVG,
  speed = 1,
  subframe,
  ...rest
}: Props){

  const { appState, setAppState } = useApp(),
    containerRef = useRef<HTMLElement>(null),

    {
      animationRef,
      load,
      setDirection,
      setLoop,
      setSpeed,
      setSubframe,
      switchInstance
    } = useLottieInstance({
      containerRef,
      direction,
      loadAnimation,
      objectFit,
      onLoadError,
      renderer,
      speed,
      subframe,
    }),

    {
      freeze,
      pause,
      play,
      seek,
      stop
    } = usePlayback({
      animationRef,
      containerRef
    }),

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

    { getIsVisible } = useGlobalEvents({
      animationRef,
      container: containerRef.current,
      freeze,
      play
    })

  useEffect(() => {
    void load(appState.src)
  }, [appState.src, load])

  useImperativeHandle(
    ref, () => {
      return {
        addAnimation: async (...args) => {
          const { addAnimation } = await getDotLottieModule()

          return addAnimation(...args)
        },
        convert: async (...args) => {
          const { convert } = await getDotLottieModule()

          return convert(...args)
        },
        getIsVisible,
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
      getIsVisible,
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
    ]
  )

  usePlayerEvents({
    animationRef,
    containerRef,
    count,
    hover,
    intermission,
    next,
    onComplete,
    onError: onLoadError,
    onLoad,
    play,
    stop,
    switchInstance
  })

  return (
    <div
      className={classnames([styles.dotLottie, className])}
      lang={appState.lang}
      aria-label={description}
      aria-hidden={!description || undefined}
      data-controls={appState.controls}
      {...rest}
    >
      <figure className={styles.animation} ref={containerRef} style={{ background }}>
        {appState.playerState === PlayerState.Error &&
          <Suspense>
            <div className={styles.error}>
              <ErrorMessage />
            </div>
          </Suspense>
        }
      </figure>
      {appState.controls &&
        <Suspense>
          <Controls
            animationRef={animationRef}
            containerRef={containerRef}
            freeze={freeze}
            next={next}
            pause={pause}
            play={play}
            previous={previous}
            seek={seek}
            setLoop={setLoop}
            stop={stop}
          />
        </Suspense>
      }
    </div>
  )
}
