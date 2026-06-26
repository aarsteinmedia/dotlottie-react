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
  useCallback, useEffect, useImperativeHandle, useRef, useState
} from 'react'

import type { DotLottieMethods } from '@/types'

import {
  usePlayerDispatch,
  usePlayerState,
  usePlayerStateRef
} from '@/hooks/useApp'
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
  description?: string
  direction?: AnimationDirection,
  hover?: boolean
  intermission?: number
  loadAnimation: (params: AnimationConfiguration) => AnimationItem
  loopLimit?: number
  objectFit?: ObjectFit
  onComplete?: () => void
  onError?: (message?: string) => void
  onLoad?: () => void
  ref?: React.RefObject<DotLottieMethods | null>
  renderer?: RendererType
  speed?: number,
  subframe?: boolean
}
export default function Player({
  background,
  className = '',
  description,
  direction = 1,
  hover,
  intermission,
  loadAnimation,
  loopLimit = 0,
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

  const dispatch = usePlayerDispatch(),
    stateRef = usePlayerStateRef(),
    playerState = usePlayerState(),
    containerRef = useRef<HTMLElement>(null),
    [containerNode, setContainerNode] = useState<HTMLElement | null>(null),

    setContainerRef = useCallback((node: HTMLElement | null) => {
      containerRef.current = node
      setContainerNode(node)
    }, []),

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
      const { playback } = stateRef.current,
        currentAnimation = clamp(playback.currentAnimation - 1, 0)

      switchInstance(currentAnimation, true)

    }, [stateRef, switchInstance]),

    /**
     * Skip to next animation.
     */
    next = useCallback(() => {
      const { asset, playback } = stateRef.current,
        currentAnimation = clamp(playback.currentAnimation + 1, asset.animations.length)

      switchInstance(currentAnimation)

    }, [stateRef, switchInstance]),

    setLoopsCompleted = useCallback((value: number) => {
      dispatch({
        patch: { loopsCompleted: value },
        type: 'SET_PLAYBACK'
      })
    }, [dispatch]),

    setMultiAnimationSettings = useCallback((settings: AnimationSettings[]) => {
      dispatch({
        settings,
        type: 'SET_MULTI_ANIMATION_SETTINGS'
      })
    }, [dispatch]),

    setSegment = useCallback((segment: AnimationSegment) => {
      dispatch({
        segment,
        type: 'SET_SEGMENT'
      })
    }, [dispatch]),

    { getIsVisible } = useGlobalEvents({
      animationRef,
      container: containerNode,
      freeze,
      play
    }),

    { config } = stateRef.current

  useEffect(() => {
    void load(config.src)
  }, [config.src, load])

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
        setDirection,
        setLoop,
        setLoopsCompleted,
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
      setLoopsCompleted,
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
    hover,
    intermission,
    loopLimit,
    next,
    onComplete,
    onError: onLoadError,
    onLoad,
    play,
    stop,
    switchInstance
  })

  return (
    <section
      className={classnames([styles.dotLottie, className])}
      lang={config.lang}
      data-controls={config.controls}
      {...rest}
    >
      <figure className={styles.animation} aria-hidden={!description && !config.controls || undefined} ref={setContainerRef} style={{ background }}>
        {playerState === PlayerState.Error &&
          <Suspense>
            <div className={styles.error}>
              <ErrorMessage />
            </div>
          </Suspense>
        }
        {description && <figcaption>{description}</figcaption>}
      </figure>
      {config.controls &&
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
    </section>
  )
}
