import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import { PlayerEvents, PlayerState } from '@/enums'
import useApp from '@/hooks/useApp'
import { handleSeek } from '@/utils/handleSeek'

interface Props {
  animationRef: React.RefObject<AnimationItem | null>
  containerRef: React.RefObject<HTMLElement | null>
}

export function usePlayback({
  animationRef,
  containerRef,
}: Props) {

  const { appState, setAppState } = useApp(),

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
      setAppState(prev => {
        return {
          ...prev,
          playerState: PlayerState.Frozen,
          prevState: prev.playerState === PlayerState.Frozen ? prev.prevState : prev.playerState
        }
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
      setAppState(prev => ({
        ...prev,
        playerState: PlayerState.Paused,
        prevState: prev.playerState
      }))
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
      setAppState(prev => {
        return {
          ...prev,
          playerState: PlayerState.Playing
        }
      })
    },

    /**
     * Seek to a given frame.
     *
     * @param value - Frame to seek to.
     */
    seek = (value: number | string, seekOrigin?: PlayerState) => {
      handleSeek({
        animationItem: animationRef.current,
        seekOrigin: seekOrigin ?? appState.playerState,
        setAppState,
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
      setAppState((prev) => ({
        ...prev,
        count: 0,
        playerState: PlayerState.Stopped,
        prevState: prev.playerState
      }))
    }


  return {
    freeze,
    pause,
    play,
    seek,
    stop
  }
}