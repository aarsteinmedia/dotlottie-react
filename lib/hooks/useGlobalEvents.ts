import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import { isServer } from '@aarsteinmedia/lottie-web/utils'
import { useCallback, useRef } from 'react'

import { PlayerState } from '@/enums'
import {
  usePlayerDispatch,
  usePlayerStateRef
} from '@/hooks/useApp'
import { useEventListener } from '@/hooks/useEventListener'
import { useIsVisible } from '@/hooks/useIsVisible'
import { hasReducedMotion } from '@/utils/constants'

interface Props {
  animationRef: React.RefObject<null | AnimationItem>
  container: null | HTMLElement
  freeze: () => void
  play: () => void
}

export function useGlobalEvents({
  animationRef,
  container,
  freeze,
  play
}: Props) {
  const stateRef = usePlayerStateRef(),
    dispatch = usePlayerDispatch(),
    scrollTimeout = useRef<ReturnType<typeof setTimeout>>(null),

    { isVisible, scrollPos } = useIsVisible({
      container,
      freeze,
      play
    }),

    handleWindowBlur = ({ type }: FocusEvent) => {
      const { config, playback } = stateRef.current

      if (playback.playerState === PlayerState.Playing && type === 'blur') {
        freeze()
      }
      if (
        playback.playerState === PlayerState.Frozen &&
        playback.prevState === PlayerState.Playing &&
        !config.animateOnScroll &&
        type === 'focus'
      ) {
        play()
      }
    },

    /**
     * Handle scroll.
     */
    handleScroll = () => {
      const { config } = stateRef.current

      if (hasReducedMotion || !config.animateOnScroll || !animationRef.current) {
        return
      }
      if (isServer) {
        console.warn('DotLottie: Scroll animations might not work properly in a Server Side Rendering context. Try to wrap this in a client component.')

        return
      }
      if (isVisible) {
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current)
        }
        scrollTimeout.current = setTimeout(() => {
          dispatch({
            patch: { playerState: PlayerState.Paused },
            type: 'SET_PLAYBACK'
          })
        }, 400)

        const adjustedScroll =
          scrollY > scrollPos
            ? scrollY - scrollPos
            : scrollPos - scrollY,
          clampedScroll = Math.min(Math.max(adjustedScroll / 3, 1),
            animationRef.current.totalFrames * 3),
          roundedScroll = clampedScroll / 3

        requestAnimationFrame(() => {
          if (roundedScroll < (animationRef.current?.totalFrames ?? 0)) {
            dispatch({
              patch: { playerState: PlayerState.Playing },
              type: 'SET_PLAYBACK'
            })
            animationRef.current?.goToAndStop(roundedScroll, true)
          } else {
            dispatch({
              patch: { playerState: PlayerState.Paused },
              type: 'SET_PLAYBACK'
            })
          }
        })
      }
    },

    getIsVisible = useCallback(() => {
      return isVisible
    }, [isVisible])

  useEventListener(
    'focus', handleWindowBlur, {
      capture: false,
      passive: true
    }
  )
  useEventListener(
    'blur', handleWindowBlur, {
      capture: false,
      passive: true
    }
  )
  useEventListener(
    'scroll', handleScroll, {
      capture: true,
      passive: true
    }
  )

  return { getIsVisible }
}