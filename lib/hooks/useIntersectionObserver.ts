import {
  useEffect, useState, useSyncExternalStore
} from 'react'

import { HAS_IO_SUPPORT } from '@/utils/constants'

const noop = () => undefined,
  subscribeNoop = () => noop

export function useIntersectionObserver(refObject: React.RefObject<HTMLElement | null>,
  options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false),
    // false on the server and during hydration, so markup matches; true afterwards if unsupported
    hasNoSupport = useSyncExternalStore(
      subscribeNoop, () => !HAS_IO_SUPPORT, () => false
    )

  useEffect(() => {
    const { current: toObserve } = refObject

    if (!toObserve || !HAS_IO_SUPPORT) {
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

  return isInView || hasNoSupport
}