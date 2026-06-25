import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import { isServer } from '@aarsteinmedia/lottie-web/utils'
import { useCallback, useRef } from 'react'

import { PlayerState } from '@/enums'
import {
  usePlayerDispatch,
  usePlayerStateRef
} from '@/hooks/useApp'
import {
  SCROLL_LISTENER_OPTS, useEventListener, WINDOW_LISTENER_OPTS
} from '@/hooks/useEventListener'
import { useIsVisible } from '@/hooks/useIsVisible'
import { hasReducedMotion } from '@/utils/constants'
import { getSeeker } from '@/utils/getSeeker'

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
    frozenByVisibility = useRef(false),

    { isVisible, scrollPos } = useIsVisible({
      container,
      freeze,
      play
    }),

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
          const { current: item } = animationRef

          dispatch({
            patch: {
              playerState: PlayerState.Paused,
              seeker: item ? getSeeker(item) : 0,
            },
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
          const { current: item } = animationRef

          if (!item) {
            return
          }

          if (roundedScroll < item.totalFrames) {
            item.goToAndStop(roundedScroll, true)
            dispatch({
              patch: {
                playerState: PlayerState.Playing,
                seeker: getSeeker(item),
              },
              type: 'SET_PLAYBACK'
            })
          } else {
            dispatch({
              patch: {
                playerState: PlayerState.Paused,
                seeker: getSeeker(item),
              },
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
    'focus', handleWindowBlur, WINDOW_LISTENER_OPTS
  )
  useEventListener(
    'blur', handleWindowBlur, WINDOW_LISTENER_OPTS
  )
  useEventListener(
    'scroll', handleScroll, {
      ...SCROLL_LISTENER_OPTS,
      enabled: Boolean(stateRef.current.config.animateOnScroll) && !hasReducedMotion
    }
  )

  return { getIsVisible }
}