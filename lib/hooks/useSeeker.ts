import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import { useEffect, useState } from 'react'

export function useSeeker(animationRef: React.RefObject<null | AnimationItem>,
  isActive: boolean) {
  const [seeker, setSeeker] = useState(0)

  useEffect(() => {
    if (!isActive) {
      return
    }

    let frameId = 0

    const tick = () => {
      const { current: item } = animationRef

      if (item && item.totalFrames > 0) {
        const next = Math.round(item.currentFrame / item.totalFrames * 100)

        setSeeker(prev => prev === next ? prev : next)
      }
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameId)
    }

  }, [animationRef, isActive])

  return seeker
}