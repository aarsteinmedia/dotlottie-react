import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import { usePlayerDispatch, usePlayerStateRef } from '@/hooks/useApp'
import { isPlaybackLocked } from '@/utils'
import { PlayerState } from '@/utils/enums'
import { getSeeker } from '@/utils/getSeeker'
import { handleSeek } from '@/utils/handleSeek'

interface Props { animationRef: React.RefObject<AnimationItem | null> }

export function usePlayback({ animationRef }: Props) {

  const dispatch = usePlayerDispatch(),
    stateRef = usePlayerStateRef(),

    freeze = () => {
      const { current: item } = animationRef

      if (!item || isPlaybackLocked(stateRef)) {
        return
      }

      const { playback } = stateRef.current

      if (playback.playerState === PlayerState.Frozen) {
        return
      }

      item.pause()

      dispatch({
        patch: {
          playerState: PlayerState.Frozen,
          seeker: getSeeker(item),
        },
        type: 'SET_PLAYBACK'
      })
    },

    /**
     * Pause.
     */
    pause = () => {
      const { current: item } = animationRef

      if (!item || isPlaybackLocked(stateRef)) {
        return
      }

      item.pause()

      dispatch({
        patch: {
          playerState: PlayerState.Paused,
          seeker: getSeeker(item),
        },
        type: 'SET_PLAYBACK'
      })

    },

    /**
     * Play.
     */
    play = () => {
      const { current: item } = animationRef

      if (!item || isPlaybackLocked(stateRef)) {
        return
      }

      item.play()

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
      if (isPlaybackLocked(stateRef)) {
        return
      }

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
      const { current: item } = animationRef

      if (!item || isPlaybackLocked(stateRef)) {
        return
      }

      item.stop()

      dispatch({
        patch: {
          loopsCompleted: 0,
          playerState: PlayerState.Stopped,
          seeker: 0,
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