import {
  useEffect, useState, useRef
} from 'react'

export default function useIsVisible(container: null | HTMLElement) {
  const instersectionObserver = useRef<IntersectionObserver>(null),
    [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!container || instersectionObserver.current || !('IntersectionObserver' in window)) {
      return
    }

    instersectionObserver.current = new IntersectionObserver((entries) => {
      const { length } = entries

      for (let i = 0; i < length; i++) {
        if (!entries[i].isIntersecting || document.hidden) {
          setIsVisible(false)

          continue
        }

        setIsVisible(true)
      }
    })

    instersectionObserver.current.observe(container)

    return () => {
      instersectionObserver.current?.disconnect()
    }

  }, [container])

  return isVisible
}