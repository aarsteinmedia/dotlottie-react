import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import { PlayerEvents, PlayerState } from '@/enums'
import { usePlayerDispatch, usePlayerStateRef } from '@/hooks/useApp'
import { handleSeek } from '@/utils/handleSeek'

interface Props {
  animationRef: React.RefObject<AnimationItem | null>
  containerRef: React.RefObject<HTMLElement | null>
}

export function usePlayback({
  animationRef,
  containerRef,
}: Props) {

  const dispatch = usePlayerDispatch(),
    stateRef = usePlayerStateRef(),

    /**
     * Freeze animation.
     * This internal state pauses animation and is used to differentiate between
     * user requested pauses and component instigated pauses.
     */
    freeze = () => {
      if (!animationRef.current) {
        return
      }

      animationRef.current.pause()
      containerRef.current?.dispatchEvent(new CustomEvent(PlayerEvents.Freeze))

      dispatch({
        patch: { playerState: PlayerState.Frozen },
        type: 'SET_PLAYBACK'
      })
    },

    /**
     * Pause.
     */
    pause = () => {
      if (!animationRef.current) {
        return
      }

      animationRef.current.pause()
      containerRef.current?.dispatchEvent(new CustomEvent(PlayerEvents.Pause))

      dispatch({
        patch: { playerState: PlayerState.Paused },
        type: 'SET_PLAYBACK'
      })

    },

    /**
     * Play.
     */
    play = () => {
      if (!animationRef.current) {
        return
      }

      animationRef.current.play()
      containerRef.current?.dispatchEvent(new CustomEvent(PlayerEvents.Play))

      dispatch({
        patch: { playerState: PlayerState.Playing },
        type: 'SET_PLAYBACK'
      })
    },

    /**
     * Seek to a given frame.
     *
     * @param value - Frame to seek to.
     */
    seek = (value: number | string, seekOrigin?: PlayerState) => {
      const { playback } = stateRef.current

      handleSeek({
        animationItem: animationRef.current,
        dispatch,
        seekOrigin: seekOrigin ?? playback.playerState,
        value
      })
    },

    /**
     * Stop.
     */
    stop = () => {
      if (!animationRef.current) {
        return
      }

      animationRef.current.stop()
      containerRef.current?.dispatchEvent(new CustomEvent(PlayerEvents.Stop))

      dispatch({
        patch: {
          loopsCompleted: 0,
          playerState: PlayerState.Stopped,
        },
        type: 'SET_PLAYBACK'
      })
    }


  return {
    freeze,
    pause,
    play,
    seek,
    stop
  }
}