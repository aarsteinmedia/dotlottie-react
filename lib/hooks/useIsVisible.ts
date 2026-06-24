import {
  useEffect, useRef, useState
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
  const { appState } = useApp(),
    appStateRef = useRef(appState),
    freezeRef = useRef(freeze),
    playRef = useRef(play),
    [state, setState] = useState({
      isVisible: !('IntersectionObserver' in window),
      scrollPos: 0
    })

  useEffect(() => {
    appStateRef.current = appState
  }, [appState])

  useEffect(() => {
    freezeRef.current = freeze
    playRef.current = play
  }, [freeze, play])

  useEffect(() => {
    if (!container || !('IntersectionObserver' in window)) {
      return
    }

    const observer = new IntersectionObserver((entries) => {
      const { length } = entries

      for (let i = 0; i < length; i++) {
        const {
          animateOnScroll: hasAnimateOnScroll,
          playerState,
          prevState
        } = appStateRef.current

        if (!entries[i].isIntersecting || document.hidden) {
          setState(prev => ({
            ...prev,
            isVisible: false
          }))

          if (playerState === PlayerState.Playing) {
            freezeRef.current()
          }

          continue
        }

        setState(prev => ({
          isVisible: true,
          scrollPos: prev.scrollPos || scrollY,
        }))

        // Only resume after visibility freeze (was playing), not slider scrub freeze.
        if (
          !hasAnimateOnScroll &&
          playerState === PlayerState.Frozen &&
          prevState === PlayerState.Playing
        ) {
          playRef.current()
        }
      }
    })

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [container])

  return {
    isVisible: state.isVisible,
    scrollPos: state.scrollPos
  }
}
