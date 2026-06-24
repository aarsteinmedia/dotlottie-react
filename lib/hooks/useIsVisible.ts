import {
  useEffect, useState, useRef
} from 'react'

import { PlayerState } from '@/enums'

import useApp from './useApp'

interface Props {
  container: null | HTMLElement
  freeze: () => void
  play: () => void
}

export default function useIsVisible({
  container,
  freeze,
  play
}: Props) {
  const intersectionObserver = useRef<IntersectionObserver>(null),
    { appState } = useApp(),
    [state, setState] = useState({
      isVisible: !('IntersectionObserver' in window),
      scrollPos: 0
    })

  useEffect(() => {
    if (!container || intersectionObserver.current || !('IntersectionObserver' in window)) {
      return
    }

    intersectionObserver.current = new IntersectionObserver((entries) => {
      const { length } = entries

      for (let i = 0; i < length; i++) {
        if (!entries[i].isIntersecting || document.hidden) {
          setState(prev => ({
            ...prev,
            isVisible: false
          }))

          if (appState.playerState === PlayerState.Playing) {
            freeze()
          }

          continue
        }

        setState(prev => ({
          isVisible: true,
          scrollPos: prev.scrollPos || scrollY,
        }))

        if (!appState.animateOnScroll && appState.playerState === PlayerState.Frozen) {
          play()
        }
      }
    })

    intersectionObserver.current.observe(container)

    return () => {
      intersectionObserver.current?.disconnect()
    }

  }, [
    appState.animateOnScroll,
    appState.playerState,
    container,
    freeze,
    play
  ])

  return {
    isVisible: state.isVisible,
    scrollPos: state.scrollPos
  }
}