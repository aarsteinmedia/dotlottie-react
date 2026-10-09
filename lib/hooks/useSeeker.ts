import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import { useEffect, useState } from 'react'

import { getSeeker } from '@/utils/getSeeker'

export function useSeeker(animationRef: React.RefObject<null | AnimationItem>,
  isActive: boolean) {
  const [seeker, setSeeker] = useState(0)

  useEffect(() => {
    if (!isActive) {
      return
    }

    let frameId = 0

    const tick = () => {
      const { current: item } = animationRef,
        next = getSeeker(item)

      setSeeker(prev => prev === next ? prev : next)

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameId)
    }

  }, [animationRef, isActive])

  return seeker
}