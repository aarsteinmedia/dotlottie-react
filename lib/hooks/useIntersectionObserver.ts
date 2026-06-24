import { useEffect, useRef } from 'react'

export default function useIntersectionObserver(
  onVisible: () => void, onHidden: () => void, container: null | HTMLElement
) {
  const intersectionObserver = useRef<IntersectionObserver>(null)

  useEffect(() => {
    if (!container || intersectionObserver.current || !('IntersectionObserver' in window)) {
      return
    }

    intersectionObserver.current = new IntersectionObserver((entries) => {
      const { length } = entries

      for (let i = 0; i < length; i++) {
        if (!entries[i].isIntersecting || document.hidden) {
          onHidden()

          continue
        }

        onVisible()
      }
    })

    intersectionObserver.current.observe(container)

    return () => {
      intersectionObserver.current?.disconnect()
    }
  }, [container,
    onHidden,
    onVisible])
}