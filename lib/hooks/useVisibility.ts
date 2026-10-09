import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import {
  useCallback, useEffect, useRef
} from 'react'

import {
  usePlayerDispatch, usePlayerState, usePlayerStateRef
} from '@/hooks/useApp'
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
    playerState = usePlayerState(),
    frozenByVisibility = useRef(false),

    isInView = useIntersectionObserver(containerRef),

    handleIsVisible = useCallback((isVisible: boolean) => {
      const { config, playback } = stateRef.current

      if (!isVisible && playback.playerState === PlayerState.Playing) {
        freeze()
        frozenByVisibility.current = true
      }

      if (
        isVisible &&
        playback.playerState === PlayerState.Frozen &&
        frozenByVisibility.current &&
        !config.animateOnScroll
      ) {
        play()
        frozenByVisibility.current = false
      }
    }, [freeze,
      play,
      // eslint-disable-next-line react-hooks/preserve-manual-memoization
      stateRef]),

    handleWindowBlur = ({ type }: FocusEvent) => {
      if (type !== 'focus' && type !== 'blur') {
        return
      }
      handleIsVisible(type === 'focus' && isInView)
    },

    getIsVisible = () => {
      return isInView
    },
    dispatch = usePlayerDispatch()

  useEffect(() => {
    dispatch({
      patch: { isInView },
      type: 'SET_PLAYBACK'
    })
  }, [dispatch, isInView])

  useEffect(() => {
    if (isInView || playerState !== PlayerState.Playing) {
      return
    }
    freeze()
    // eslint-disable-next-line react-hooks/immutability
    frozenByVisibility.current = true
  }, [freeze,
    isInView,
    playerState])

  useEffect(() => {
    handleIsVisible(isInView)
  }, [handleIsVisible, isInView])

  useEventListener(
    'focus', handleWindowBlur, WINDOW_LISTENER_OPTS
  )
  useEventListener(
    'blur', handleWindowBlur, WINDOW_LISTENER_OPTS
  )

  return { getIsVisible }
}