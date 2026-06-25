import {
  useEffect, useRef, useState
} from 'react'

import { PlayerState } from '@/enums'
import { usePlayerStateRef } from '@/hooks/useApp'

interface Props {
  container: null | HTMLElement
  freeze: () => void
  play: () => void
}

export function useIsVisible({
  container,
  freeze,
  play
}: Props) {
  const stateRef = usePlayerStateRef(),
    freezeRef = useRef(freeze),
    playRef = useRef(play),
    [state, setState] = useState({
      isVisible: !('IntersectionObserver' in window),
      scrollPos: 0
    })

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
        const { config, playback } = stateRef.current

        if (!entries[i].isIntersecting || document.hidden) {
          setState(prev => ({
            ...prev,
            isVisible: false
          }))

          if (playback.playerState === PlayerState.Playing) {
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
          !config.animateOnScroll &&
          playback.playerState === PlayerState.Frozen &&
          playback.prevState === PlayerState.Playing
        ) {
          playRef.current()
        }
      }
    })

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [container, stateRef])

  return {
    isVisible: state.isVisible,
    scrollPos: state.scrollPos
  }
}
