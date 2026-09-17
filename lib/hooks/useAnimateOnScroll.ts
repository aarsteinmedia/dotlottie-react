import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import { clamp } from '@aarsteinmedia/lottie-web/utils'
import {
  useCallback, useEffect, useRef
} from 'react'

import { usePlayerStateRef } from '@/hooks/useApp'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { hasVTSupport } from '@/utils/constants'

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
    { current: { config } } = usePlayerStateRef(),
    applyScrollProgress = () => {
      if (!config.animateOnScroll) {
        return
      }

      const progress = getScrollProgress(containerRef.current, scrollProbe)

      if (progress === null) {
        return
      }

      const { totalFrames = 0 } = animationRef.current ?? {},
        newFrame = progress * (totalFrames - 1),
        epsilon = config.subframe ? 0.1 : 0.5

      if (Math.abs(newFrame - prevFrame.current) < epsilon) {
        return
      }

      prevFrame.current = newFrame
      animationRef.current?.goToAndStop(newFrame, true)
    },
    scrollLoop = () => {
      scrollLoopId.current = requestAnimationFrame(scrollLoop)
      applyScrollProgress()
    },
    startScrollLoop = useCallback(() => {
      scrollLoopId.current ??= requestAnimationFrame(scrollLoop)
    }, []),
    stopScrollLoop = useCallback(() => {
      if (scrollLoopId.current === null) {
        return
      }

      cancelAnimationFrame(scrollLoopId.current)
      scrollLoopId.current = null

      applyScrollProgress()
    }, [containerRef])

  useEffect(() => {
    if (isInView) {
      startScrollLoop()
    } else {
      stopScrollLoop()
    }
  }, [isInView,
    startScrollLoop,
    stopScrollLoop])
}