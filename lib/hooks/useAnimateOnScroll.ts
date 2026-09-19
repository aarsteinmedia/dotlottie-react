import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import { clamp } from '@aarsteinmedia/lottie-web/utils'
import { useEffect, useRef } from 'react'

import {
  usePlayerDispatch, usePlayerStateRef, usePlayerStore
} from '@/hooks/useApp'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { usePlayback } from '@/hooks/usePlayback'
import { hasVTSupport } from '@/utils/constants'
import { getSeeker } from '@/utils/getSeeker'

const getScrollProgress = (container: HTMLElement | null, scrollProbe: React.RefObject<Animation | null>) => {
  if (!container) {
    return null
  }

  if (hasVTSupport) {
    scrollProbe.current ??= container.animate({ '--dotlottie-scroll': [0, 1] }, {
      fill: 'both',
      rangeEnd: 'cover 100%',
      rangeStart: 'cover 0%',
      timeline: new ViewTimeline({
        axis: 'block',
        subject: container
      })
    })

    return scrollProbe.current.effect?.getComputedTiming().progress ?? null
  }

  const { height, top } = container.getBoundingClientRect(),
    viewport = visualViewport?.height ?? innerHeight

  return clamp(
    (viewport - top) / (viewport + height), 0, 1
  )
}

export function useAnimateOnScroll(containerRef: React.RefObject<HTMLElement | null>, animationRef: React.RefObject<AnimationItem | null>) {
  const isInView = useIntersectionObserver(containerRef),
    scrollLoopId = useRef<number>(null),
    scrollProbe = useRef<Animation>(null),
    prevFrame = useRef(0),
    stateRef = usePlayerStateRef(),
    dispatch = usePlayerDispatch(),
    { pause, play } = usePlayback({ animationRef }),

    /**
     * Subscribed to – rather than read from the state ref – so that the loop
     * reacts to `animateOnScroll` being toggled after the initial render.
     */
    { config: { animateOnScroll: hasAnimateOnScroll, autoplay: hasAutoplay } } = usePlayerStore(),
    hadAnimateOnScroll = useRef(hasAnimateOnScroll),

    applyScrollProgress = () => {
      const { config } = stateRef.current

      if (!config.animateOnScroll || !animationRef.current) {
        return
      }

      const progress = getScrollProgress(containerRef.current, scrollProbe)

      if (progress === null) {
        return
      }

      const { totalFrames } = animationRef.current,
        newFrame = progress * (totalFrames - 1),
        epsilon = config.subframe ? 0.1 : 0.5

      if (Math.abs(newFrame - prevFrame.current) < epsilon) {
        return
      }

      prevFrame.current = newFrame
      animationRef.current.goToAndStop(newFrame, true)
      dispatch({
        patch: { seeker: getSeeker(animationRef.current) },
        type: 'SET_PLAYBACK'
      })
    },
    scrollLoop = () => {
      scrollLoopId.current = requestAnimationFrame(scrollLoop)
      applyScrollProgress()
    },
    startScrollLoop = useRef(() => {
      scrollLoopId.current ??= requestAnimationFrame(scrollLoop)
    }),
    stopScrollLoop = useRef(() => {
      if (scrollLoopId.current === null) {
        return
      }

      cancelAnimationFrame(scrollLoopId.current)
      scrollLoopId.current = null

      applyScrollProgress()
    }),
    disposeScrollProbe = useRef(() => {
      scrollProbe.current?.cancel()
      scrollProbe.current = null
      prevFrame.current = 0
    }),

    /**
     * Hand playback over to – or back from – the scroll loop.
     */
    handOverPlayback = useRef((isScrollDriven: boolean, isAutoplaying: boolean) => {
      if (!animationRef.current) {
        return
      }

      if (isScrollDriven) {
        // Seek on the next tick, no matter where playback left off.
        prevFrame.current = Number.NEGATIVE_INFINITY
        pause()

        return
      }

      disposeScrollProbe.current()

      if (isAutoplaying) {
        play()
      }
    })

  useEffect(() => {
    if (hadAnimateOnScroll.current === hasAnimateOnScroll) {
      return
    }

    hadAnimateOnScroll.current = hasAnimateOnScroll

    handOverPlayback.current(hasAnimateOnScroll ?? false, hasAutoplay ?? false)
  }, [hasAnimateOnScroll, hasAutoplay])

  useEffect(() => {
    const stop = stopScrollLoop.current

    if (!hasAnimateOnScroll || !isInView) {
      stop()

      return
    }

    startScrollLoop.current()

    return stop
  }, [hasAnimateOnScroll, isInView])

  useEffect(() => disposeScrollProbe.current, [])
}
