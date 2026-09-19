import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import { useCallback, useRef } from 'react'

import { usePlayerStateRef } from '@/hooks/useApp'
import { useEventListener, WINDOW_LISTENER_OPTS } from '@/hooks/useEventListener'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { PlayerState } from '@/utils/enums'

interface Props {
  animationRef: React.RefObject<null | AnimationItem>
  containerRef: React.RefObject<null | HTMLElement>
  freeze: () => void
  play: () => void
}

export function useVisibility({
  containerRef,
  freeze,
  play
}: Props) {
  const stateRef = usePlayerStateRef(),
    frozenByVisibility = useRef(false),

    isVisible = useIntersectionObserver(containerRef),

    handleWindowBlur = ({ type }: FocusEvent) => {
      const { config, playback } = stateRef.current

      if (playback.playerState === PlayerState.Playing && type === 'blur') {
        freeze()
        frozenByVisibility.current = true
      }
      if (
        playback.playerState === PlayerState.Frozen &&
        frozenByVisibility.current &&
        !config.animateOnScroll &&
        type === 'focus'
      ) {
        play()
        frozenByVisibility.current = false
      }
    },

    getIsVisible = useCallback(() => {
      return isVisible
    }, [isVisible])

  useEventListener(
    'focus', handleWindowBlur, WINDOW_LISTENER_OPTS
  )
  useEventListener(
    'blur', handleWindowBlur, WINDOW_LISTENER_OPTS
  )

  return { getIsVisible }
}