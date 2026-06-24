import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import { isServer } from '@aarsteinmedia/lottie-web/utils'
import { useCallback, useRef } from 'react'

import { PlayerState } from '@/enums'
import { useApp } from '@/hooks/useApp'
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
  const { appState, setAppState } = useApp(),
    scrollTimeout = useRef<ReturnType<typeof setTimeout>>(null),

    { isVisible, scrollPos } = useIsVisible({
      container,
      freeze,
      play
    }),

    handleWindowBlur = ({ type }: FocusEvent) => {
      if (appState.playerState === PlayerState.Playing && type === 'blur') {
        freeze()
      }
      if (
        appState.playerState === PlayerState.Frozen &&
        appState.prevState === PlayerState.Playing &&
        !appState.animateOnScroll &&
        type === 'focus'
      ) {
        play()
      }
    },

    /**
     * Handle scroll.
     */
    handleScroll = () => {
      if (hasReducedMotion || !appState.animateOnScroll || !animationRef.current) {
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
          setAppState(prev => {
            return {
              ...prev,
              playerState: PlayerState.Paused
            }
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
            setAppState(prev => {
              return {
                ...prev,
                playerState: PlayerState.Playing
              }
            })
            animationRef.current?.goToAndStop(roundedScroll, true)
          } else {
            setAppState(prev => {
              return {
                ...prev,
                playerState: PlayerState.Paused
              }
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