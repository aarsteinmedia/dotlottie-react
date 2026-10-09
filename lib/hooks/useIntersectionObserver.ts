import { useEffect, useState } from 'react'

import { hasIOSupport } from '@/utils/constants'

export function useIntersectionObserver(refObject: React.RefObject<HTMLElement | null>,
  options?: IntersectionObserverInit) {
  // Without IntersectionObserver we can't tell, so assume visible
  const [isInView, setIsInView] = useState(!hasIOSupport)

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