import {
  useEffect, useRef, useState
} from 'react'

import { PlayerState } from '@/enums'
import { usePlayerConfig, usePlayerPlayback } from '@/hooks/useApp'

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
  const playback = usePlayerPlayback(),
    config = usePlayerConfig(),
    appStateRef = useRef({
      hasAnimateOnScroll: config.animateOnScroll,
      playerState: playback.playerState,
      prevState: playback.prevState
    }),
    freezeRef = useRef(freeze),
    playRef = useRef(play),
    [state, setState] = useState({
      isVisible: !('IntersectionObserver' in window),
      scrollPos: 0
    })

  useEffect(() => {
    appStateRef.current = {
      hasAnimateOnScroll: config.animateOnScroll,
      playerState: playback.playerState,
      prevState: playback.prevState
    }
  }, [
    config.animateOnScroll,
    playback.playerState,
    playback.prevState
  ])

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
          hasAnimateOnScroll,
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
