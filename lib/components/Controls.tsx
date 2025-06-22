'use client'
import type { AnimationDirection, AnimationItem } from '@aarsteinmedia/lottie-web'

import { convert } from '@aarsteinmedia/lottie-web/dotlottie'
import {
  download, getFilename, PlayMode
} from '@aarsteinmedia/lottie-web/utils'
import { use, useState } from 'react'

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
import AppContext from '@/context/AppContext'
import styles from '@/styles/controls.module.css'
import { frameOutput } from '@/utils'
import { PlayerState } from '@/utils/enums'

export default function Controls({
  animationItem,
  container,
  freeze,
  next,
  pause,
  play,
  previous,
  seek,
  setLoop,
  stop,
}: {
  animationItem: React.RefObject<AnimationItem | null>
  container: React.RefObject<HTMLElement | null>
  freeze: () => void
  next: () => void
  pause: () => void
  play: () => void
  previous: () => void
  seek: (frame: number) => void
  setLoop: (val: boolean) => void
  stop: () => void
}) {
  const { appState, setAppState } = use(AppContext),
    [state, setState] = useState({ isSettingsOpen: false }),

    /**
     * Toggle show Settings.
     */
    toggleSettings = (flag?: boolean) => {
      if (flag === undefined) {
        setState(prev => ({ isSettingsOpen: !prev.isSettingsOpen }))

        return
      }
      setState({ isSettingsOpen: flag })
    },

    /**
    * Animation play direction.
    *
    * @param value - Animation direction.
    */
    setDirection = (value: AnimationDirection) => {
      animationItem.current?.setDirection(value)
    },

    /**
     * Toggle playing state.
     */
    togglePlay = () => {
      if (!animationItem.current) {
        return
      }

      const {
        currentFrame, playDirection, totalFrames
      } = animationItem.current

      if (appState.playerState === PlayerState.Playing) {
        pause()

        return
      }
      if (appState.playerState !== PlayerState.Completed) {
        play()

        return
      }
      setAppState(prev => ({
        ...prev,
        playerState: PlayerState.Playing
      }))
      if (appState.mode === PlayMode.Bounce) {
        setDirection((playDirection * -1) as AnimationDirection)

        animationItem.current.goToAndPlay(currentFrame, true)

        return
      }
      if (playDirection === -1) {
        animationItem.current.goToAndPlay(totalFrames, true)

        return
      }

      animationItem.current.goToAndPlay(0, true)
    },

    /**
     * Toggle loop.
     */
    toggleLoop = () => {
      const hasLoop = !appState.loop

      setAppState(prev => ({
        ...prev,
        loop: hasLoop
      }))
      setLoop(hasLoop)
    },

    /**
     * Toggle Boomerang.
     */
    toggleBoomerang = () => {
      const curr = appState.multiAnimationSettings[appState.currentAnimation] ?? {}

      if (curr.mode !== undefined) {
        if (curr.mode as PlayMode === PlayMode.Normal) {
          curr.mode = PlayMode.Bounce

          setAppState(prev => ({
            ...prev,
            mode: PlayMode.Bounce
          }))

          return
        }
        curr.mode = PlayMode.Normal
        setAppState(prev => ({
          ...prev,
          mode: PlayMode.Normal
        }))

        return
      }

      if (appState.mode === PlayMode.Normal) {
        setAppState(prev => ({
          ...prev,
          mode: PlayMode.Bounce
        }))

        return
      }

      setAppState(prev => ({
        ...prev,
        mode: PlayMode.Normal
      }))
    },

    /**
     * Handle blur.
     */
    handleBlur = () => {
      setTimeout(() => {
        toggleSettings(false)
      }, 200)
    },

    /**
     * Snapshot and download the current frame as SVG.
     */
    snapshot = (shouldDownload = true, name = 'AM Lottie') => {
      try {
        if (!container.current) {
          throw new Error('Unknown error')
        }

        // Get SVG element and serialize markup
        const svgElement = container.current.querySelector('figure svg')

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
            name: `${getFilename(appState.src || name)}-${frameOutput(appState.seeker)}.svg`,
          })
        }

        return data
      } catch (error) {
        console.error(error)

        return null
      }
    }


  return (
    <div
      className={styles.controls}
      data-error={appState.playerState === PlayerState.Error}
      aria-label="Lottie Animation controls"
    >
      <button
        className={styles.button}
        data-active={appState.playerState === PlayerState.Playing || appState.playerState === PlayerState.Paused}
        aria-label="Toggle Play/Pause"
        onClick={togglePlay}
      >
        {appState.playerState === PlayerState.Playing ?
          <PauseIcon />
          :
          <PlayIcon />
        }
      </button>

      <button
        className={styles.button}
        data-active={appState.playerState === PlayerState.Stopped || appState.playerState === PlayerState.Loading}
        aria-label="Stop"
        onClick={stop}
      >
        <StopIcon />
      </button>
      <button
        hidden={appState.animations.length === 0 || appState.currentAnimation === 0}
        className={styles.button}
        aria-label="Previous animation"
        onClick={previous}
      >
        <PreviousIcon />
      </button>
      <button
        hidden={appState.animations.length === 0 || appState.currentAnimation === appState.animations.length - 1}
        className={styles.button}
        aria-label="Next animation"
        onClick={next}
      >
        <NextIcon />
      </button>
      <form
        className={styles.progressContainer}
        data-simple={appState.simple}
      >
        <input
          type="range"
          className={styles.seeker}
          min={0}
          max={100}
          step={1}
          value={appState.seeker}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={appState.seeker}
          tabIndex={0}
          aria-label="Slider for search"
          onMouseDown={freeze}
          onChange={({ target }) => {
            if (!animationItem.current) {
              return
            }

            seek(Math.round(Number(target.value) / 100 * animationItem.current.totalFrames))
          }}
        />
        <progress className={styles.progress} max="100" value={appState.seeker}></progress>
      </form>
      {!appState.simple &&
        <>
          <button
            className={styles.button}
            data-active={appState.loop}
            tabIndex={0}
            aria-label="Toggle loop"
            onClick={toggleLoop}
          >
            <LoopIcon />
          </button>
          <button
            className={styles.button}
            data-active={appState.mode === PlayMode.Bounce}
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
            aria-expanded={Boolean(state.isSettingsOpen)}
            aria-controls={`${appState.id}-settings`}
            data-active={state.isSettingsOpen}
            onBlur={handleBlur}
            onClick={() => {
              toggleSettings()
            }}
          >
            <SettingsIcon />
          </button>
          <div hidden={!state.isSettingsOpen} id={`${appState.id}-settings`} className={styles.popover}>
            <button
              className={styles.button}
              aria-label={appState.isDotLottie ? 'Convert dotLottie to JSON' : 'Convert JSON animation to dotLottie format'}
              onClick={() => {
                void convert({
                  currentAnimation: appState.currentAnimation,
                  generator: '@aarsteinmedia/dotlottie-react',
                  isDotLottie: appState.isDotLottie,
                  manifest: appState.manifest,
                  src: appState.src ?? undefined
                })
              }}
            >
              <ConvertIcon />
              {appState.isDotLottie ? 'Convert to JSON' : 'Convert to dotLottie'}
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