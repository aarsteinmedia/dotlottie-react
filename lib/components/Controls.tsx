import type { AnimationDirection, AnimationItem } from '@aarsteinmedia/lottie-web'

import {
  download, getFilename, PlayMode
} from '@aarsteinmedia/lottie-web/utils'
import { useRef, useState } from 'react'

import BoomerangIcon from '@/components/icons/BoomerangIcon'
import ConvertIcon from '@/components/icons/ConvertIcon'
import DownloadIcon from '@/components/icons/DownloadIcon'
import LoopIcon from '@/components/icons/LoopIcon'
import NextIcon from '@/components/icons/NextIcon'
import PauseIcon from '@/components/icons/PauseIcon'
import PlayIcon from '@/components/icons/PlayIcon'
import PreviousIcon from '@/components/icons/PreviousIcon'
import SettingsIcon from '@/components/icons/SettingsIcon'
import StopIcon from '@/components/icons/StopIcon'
import {
  usePlayerAsset, usePlayerConfig, usePlayerDispatch, usePlayerPlayback
} from '@/hooks/useApp'
import { useEventListener } from '@/hooks/useEventListener'
import { useSeeker } from '@/hooks/useSeeker'
import styles from '@/styles/controls.module.css'
import { frameOutput } from '@/utils'
import { PlayerState } from '@/utils/enums'
import { getDotLottieModule } from '@/utils/getDotLottieModule'

interface Props {
  animationRef: React.RefObject<AnimationItem | null>
  containerRef: React.RefObject<HTMLElement | null>
  freeze: () => void
  next: () => void
  pause: () => void
  play: () => void
  previous: () => void
  seek: (value: number | string, seekOrigin?: PlayerState) => void
  setLoop: (val: boolean) => void
  stop: () => void
}

export default function Controls({
  animationRef,
  containerRef,
  freeze,
  next,
  pause,
  play,
  previous,
  seek,
  setLoop,
  stop,
}: Props) {
  const asset = usePlayerAsset(),
    config = usePlayerConfig(),
    playback = usePlayerPlayback(),
    dispatch = usePlayerDispatch(),
    scrubOrigin = useRef(playback.playerState),
    [state, setState] = useState({
      isScrubbing: false,
      isSettingsOpen: false
    }),

    isLive = playback.playerState === PlayerState.Playing && !state.isScrubbing,
    liveSeeker = useSeeker(animationRef, isLive),
    seeker = isLive ? liveSeeker : playback.seeker,

    /**
     * Toggle show Settings.
     */
    toggleSettings = (flag?: boolean) => {
      setState(prev => ({
        ...prev,
        isSettingsOpen: flag ?? !prev.isSettingsOpen
      }))
    },

    /**
    * Animation play direction.
    *
    * @param value - Animation direction.
    */
    setDirection = (value: AnimationDirection) => {
      animationRef.current?.setDirection(value)
    },

    /**
     * Toggle playing state.
     */
    togglePlay = () => {
      if (!animationRef.current) {
        return
      }

      const {
        currentFrame, playDirection, totalFrames
      } = animationRef.current

      if (playback.playerState === PlayerState.Playing) {
        pause()

        return
      }
      if (playback.playerState !== PlayerState.Completed) {
        play()

        return
      }
      dispatch({
        patch: { playerState: PlayerState.Playing },
        type: 'SET_PLAYBACK'
      })
      if (config.mode === PlayMode.Bounce) {
        setDirection((playDirection * -1) as AnimationDirection)

        animationRef.current.goToAndPlay(currentFrame, true)

        return
      }
      if (playDirection === -1) {
        animationRef.current.goToAndPlay(totalFrames, true)

        return
      }

      animationRef.current.goToAndPlay(0, true)
    },

    /**
     * Toggle loop.
     */
    toggleLoop = () => {
      const hasLoop = !config.loop

      dispatch({
        patch: { loop: hasLoop },
        type: 'SYNC_CONFIG'
      })
      setLoop(hasLoop)
    },

    /**
     * Toggle Boomerang.
     */
    toggleBoomerang = () => {
      const curr = asset.multiAnimationSettings[playback.currentAnimation] ?? {},
        prevMode = curr.mode ?? config.mode,
        newMode = prevMode === PlayMode.Normal ? PlayMode.Bounce : PlayMode.Normal

      if (curr.mode !== undefined) {
        dispatch({
          patch: { mode: newMode },
          type: 'SYNC_CONFIG'
        })

        dispatch({
          settings: [
            ...asset.multiAnimationSettings.slice(0, playback.currentAnimation),
            {
              ...curr,
              mode: newMode
            },
            ...asset.multiAnimationSettings.slice(playback.currentAnimation + 1)
          ],
          type: 'SET_MULTI_ANIMATION_SETTINGS'
        })

        return
      }

      dispatch({
        patch: { mode: newMode },
        type: 'SYNC_CONFIG'
      })
    },

    /**
     * Snapshot and download the current frame as SVG.
     */
    snapshot = (shouldDownload = true, name = 'AM Lottie') => {
      try {
        if (!containerRef.current) {
          throw new Error('Unknown error')
        }

        // Get SVG element and serialize markup
        const svgElement = containerRef.current.querySelector('svg')

        if (!svgElement) {
          throw new Error('Could not retrieve animation from DOM')
        }

        const data =
          svgElement instanceof Node
            ? new XMLSerializer().serializeToString(svgElement)
            : null

        if (!data) {
          throw new Error('Could not serialize SVG element')
        }

        if (shouldDownload) {
          download(data, {
            mimeType: 'image/svg+xml',
            name: `${getFilename(config.src || name)}-${frameOutput(playback.seeker)}.svg`,
          })
        }

        return data
      } catch (error) {
        console.error(error)

        return null
      }
    }

  useEventListener(
    'click', ({ target }) => {
      if (!target || !containerRef.current?.contains(target as Node)) {
        toggleSettings(false)
      }
    }, {
      capture: true,
      passive: true
    }
  )

  useEventListener(
    'keydown', ({ key }: KeyboardEvent) => {
      if (key === 'Escape') {
        toggleSettings(false)
      }
    }, {
      capture: true,
      passive: true
    }
  )

  return (
    <div
      className={styles.controls}
      data-error={playback.playerState === PlayerState.Error}
      aria-label="Lottie Animation controls"
    >
      <button
        className={styles.button}
        data-active={playback.playerState === PlayerState.Playing || playback.playerState === PlayerState.Paused}
        aria-label="Toggle Play/Pause"
        onClick={togglePlay}
      >
        {playback.playerState === PlayerState.Playing ?
          <PauseIcon />
          :
          <PlayIcon />
        }
      </button>

      <button
        className={styles.button}
        data-active={playback.playerState === PlayerState.Stopped || playback.playerState === PlayerState.Loading}
        aria-label="Stop"
        onClick={stop}
      >
        <StopIcon />
      </button>
      <button
        hidden={asset.animations.length === 0 || playback.currentAnimation === 0}
        className={styles.button}
        aria-label="Previous animation"
        onClick={previous}
      >
        <PreviousIcon />
      </button>
      <button
        hidden={asset.animations.length === 0 || playback.currentAnimation === asset.animations.length - 1}
        className={styles.button}
        aria-label="Next animation"
        onClick={next}
      >
        <NextIcon />
      </button>
      <form
        className={styles.progressContainer}
        data-simple={config.simple}
      >
        <input
          type="range"
          className={styles.seeker}
          min={0}
          max={100}
          step={1}
          value={seeker}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={seeker}
          tabIndex={0}
          aria-label="Slider for seek"
          onPointerDown={() => {
            scrubOrigin.current = playback.playerState
            setState(prev => ({
              ...prev,
              isScrubbing: true
            }))
            freeze()
          }}
          onPointerUp={() => {
            setState(prev => ({
              ...prev,
              isScrubbing: false
            }))
          }}
          onPointerCancel={() => {
            setState(prev => ({
              ...prev,
              isScrubbing: false
            }))
          }}
          onChange={({ target }) => {
            seek(`${target.value}%`, scrubOrigin.current)
          }}
        />
        <progress className={styles.progress} max="100" value={seeker}></progress>
      </form>
      {!config.simple &&
        <>
          <button
            className={styles.button}
            data-active={config.loop}
            tabIndex={0}
            aria-label="Toggle loop"
            onClick={toggleLoop}
          >
            <LoopIcon />
          </button>
          <button
            className={styles.button}
            data-active={config.mode === PlayMode.Bounce}
            aria-label="Toggle boomerang"
            tabIndex={0}
            onClick={toggleBoomerang}
          >
            <BoomerangIcon />
          </button>
          <button
            className={styles.button}
            aria-label="Settings"
            aria-haspopup="true"
            aria-expanded={state.isSettingsOpen}
            aria-controls={`${config.id}-settings`}
            data-active={state.isSettingsOpen}
            onClick={() => {
              toggleSettings()
            }}
          >
            <SettingsIcon />
          </button>
          <div hidden={!state.isSettingsOpen} id={`${config.id}-settings`} className={styles.popover}>
            <button
              className={styles.button}
              aria-label={asset.isDotLottie ? 'Convert dotLottie to JSON' : 'Convert JSON animation to dotLottie format'}
              onClick={() => {
                void (async() => {
                  const { convert } = await getDotLottieModule()

                  await convert({
                    currentAnimation: playback.currentAnimation,
                    generator: '@aarsteinmedia/dotlottie-react',
                    isDotLottie: asset.isDotLottie,
                    manifest: asset.manifest ?? undefined,
                    src: config.src ?? undefined
                  })
                })()
              }}
            >
              <ConvertIcon />
              {asset.isDotLottie ? 'Convert to JSON' : 'Convert to dotLottie'}
            </button>
            <button
              className={styles.button}
              aria-label="Download still image"
              onClick={() => snapshot(true)}
            >
              <DownloadIcon />
              Download still image
            </button>
          </div>
        </>
      }
    </div>
  )
}