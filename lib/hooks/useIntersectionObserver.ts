import { useEffect, useState } from 'react'

import { hasIOSupport } from '@/utils/constants'

export function useIntersectionObserver(refObject: React.RefObject<HTMLElement | null>,
  options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const { current: toObserve } = refObject

    if (!toObserve || !hasIOSupport) {
      return
    }

    const observer = new IntersectionObserver(([{ isIntersecting }]) => {
      setIsInView(isIntersecting)
    }, options)

    observer.observe(toObserve)

    return () => {
      observer.disconnect()
    }
  }, [options, refObject])

  return isInView
}