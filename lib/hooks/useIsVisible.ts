import {
  useEffect, useState, useRef
} from 'react'

export default function useIsVisible(container: null | HTMLElement) {
  const intersectionObserver = useRef<IntersectionObserver>(null),
    [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!container || intersectionObserver.current || !('IntersectionObserver' in window)) {
      return
    }

    intersectionObserver.current = new IntersectionObserver((entries) => {
      const { length } = entries

      for (let i = 0; i < length; i++) {
        if (!entries[i].isIntersecting || document.hidden) {
          setIsVisible(false)

          continue
        }

        setIsVisible(true)
      }
    })

    intersectionObserver.current.observe(container)

    return () => {
      intersectionObserver.current?.disconnect()
    }

  }, [container])

  return isVisible
}