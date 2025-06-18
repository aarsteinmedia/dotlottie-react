import { useEffect, useRef } from 'react'

export default function useIntersectionObserver(
  onVisible: () => void, onHidden: () => void, container: null | HTMLElement
) {
  const instersectionObserver = useRef<IntersectionObserver>(null)

  useEffect(() => {
    if (!container || instersectionObserver.current || !('IntersectionObserver' in window)) {
      return
    }

    instersectionObserver.current = new IntersectionObserver((entries) => {
      const { length } = entries

      for (let i = 0; i < length; i++) {
        if (!entries[i].isIntersecting || document.hidden) {
          onHidden()

          continue
        }

        onVisible()
      }
    })

    instersectionObserver.current.observe(container)

    return () => {
      instersectionObserver.current?.disconnect()
    }
  }, [container,
    onHidden,
    onVisible])
}