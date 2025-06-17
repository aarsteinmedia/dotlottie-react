'use client'
import { PlayMode } from '@aarsteinmedia/lottie-web/utils'
import { use, useState } from 'react'

import AppContext from '@/context/AppContext'
import styles from '@/styles/controls.module.css'
import { PlayerState } from '@/utils/enums'

export default function Controls({
  freeze,
  handleSeekChange,
  snapshot,
  stop,
  toggleLoop,
  togglePlay
}: {
  freeze: () => void
  handleSeekChange: (e: React.ChangeEvent) => void
  snapshot: (shouldDownload?: boolean, name?: string) => string | null
  stop: () => void
  toggleLoop: () => void
  togglePlay: () => void
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
     * Toggle Boomerang.
     */
    toggleBoomerang = () => {
      const curr = appState.multiAnimationSettings[appState.currentAnimation]

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (curr?.mode !== undefined) {
        if (curr.mode as PlayMode === PlayMode.Normal) {
          curr.mode = PlayMode.Bounce

          setAppState(prev => ({
            ...prev,
            isBounce: true
          }))

          return
        }
        curr.mode = PlayMode.Normal
        setAppState(prev => ({
          ...prev,
          isBounce: false
        }))

        return
      }

      if (appState.mode === PlayMode.Normal) {
        setAppState(prev => ({
          ...prev,
          isBounce: true,
          mode: PlayMode.Bounce
        }))

        return
      }

      setAppState(prev => ({
        ...prev,
        isBounce: false,
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
          <svg width="24" height="24" aria-hidden="true" focusable="false">
            <path
              d="M14.016 5.016H18v13.969h-3.984V5.016zM6 18.984V5.015h3.984v13.969H6z"
            />
          </svg>
          :
          <svg width="24" height="24" aria-hidden="true" focusable="false">
            <path d="M8.016 5.016L18.985 12 8.016 18.984V5.015z" />
          </svg>
        }
      </button>

      <button
        className={styles.button}
        data-active={appState.playerState === PlayerState.Stopped || appState.playerState === PlayerState.Loading}
        aria-label="Stop"
        onClick={stop}
      >
        <svg width="24" height="24" aria-hidden="true" focusable="false">
          <path d="M6 6h12v12H6V6z" />
        </svg>
      </button>
      <button hidden className={styles.button} aria-label="Previous animation">
        <svg width="24" height="24" aria-hidden="true" focusable="false">
          <path d="M17.9 18.2 8.1 12l9.8-6.2v12.4zm-10.3 0H6.1V5.8h1.5v12.4z" />
        </svg>
      </button>
      <button hidden className={styles.button} aria-label="Next animation">
        <svg width="24" height="24" aria-hidden="true" focusable="false">
          <path d="m6.1 5.8 9.8 6.2-9.8 6.2V5.8zM16.4 5.8h1.5v12.4h-1.5z" />
        </svg>
      </button>
      <form
        className={styles.progressContainer}
        data-simple={appState.simple}
      >
        <input
          className={styles.seeker}
          type="range"
          min={0}
          max={100}
          step={1}
          value={appState.seeker}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={appState.seeker}
          tabIndex={0}
          aria-label="Slider for search"
          onChange={handleSeekChange}
          onMouseDown={freeze}
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
            <svg width="24" height="24" aria-hidden="true" focusable="false">
              <path
                d="M17.016 17.016v-4.031h1.969v6h-12v3l-3.984-3.984 3.984-3.984v3h10.031zM6.984 6.984v4.031H5.015v-6h12v-3l3.984 3.984-3.984 3.984v-3H6.984z"
              />
            </svg>
          </button>
          <button
            className={styles.button}
            data-active={appState.mode === PlayMode.Bounce}
            aria-label="Toggle boomerang"
            tabIndex={0}
            onClick={toggleBoomerang}
          >
            <svg width="24" height="24" aria-hidden="true" focusable="false">
              <path
                d="m11.8 13.2-.3.3c-.5.5-1.1 1.1-1.7 1.5-.5.4-1 .6-1.5.8-.5.2-1.1.3-1.6.3s-1-.1-1.5-.3c-.6-.2-1-.5-1.4-1-.5-.6-.8-1.2-.9-1.9-.2-.9-.1-1.8.3-2.6.3-.7.8-1.2 1.3-1.6.3-.2.6-.4 1-.5.2-.2.5-.2.8-.3.3 0 .7-.1 1 0 .3 0 .6.1.9.2.9.3 1.7.9 2.4 1.5.4.4.8.7 1.1 1.1l.1.1.4-.4c.6-.6 1.2-1.2 1.9-1.6.5-.3 1-.6 1.5-.7.4-.1.7-.2 1-.2h.9c1 .1 1.9.5 2.6 1.4.4.5.7 1.1.8 1.8.2.9.1 1.7-.2 2.5-.4.9-1 1.5-1.8 2-.4.2-.7.4-1.1.4-.4.1-.8.1-1.2.1-.5 0-.9-.1-1.3-.3-.8-.3-1.5-.9-2.1-1.5-.4-.4-.8-.7-1.1-1.1h-.3zm-1.1-1.1c-.1-.1-.1-.1 0 0-.3-.3-.6-.6-.8-.9-.5-.5-1-.9-1.6-1.2-.4-.3-.8-.4-1.3-.4-.4 0-.8 0-1.1.2-.5.2-.9.6-1.1 1-.2.3-.3.7-.3 1.1 0 .3 0 .6.1.9.1.5.4.9.8 1.2.5.4 1.1.5 1.7.5.5 0 1-.2 1.5-.5.6-.4 1.1-.8 1.6-1.3.1-.3.3-.5.5-.6zM13 12c.5.5 1 1 1.5 1.4.5.5 1.1.9 1.9 1 .4.1.8 0 1.2-.1.3-.1.6-.3.9-.5.4-.4.7-.9.8-1.4.1-.5 0-.9-.1-1.4-.3-.8-.8-1.2-1.7-1.4-.4-.1-.8-.1-1.2 0-.5.1-1 .4-1.4.7-.5.4-1 .8-1.4 1.2-.2.2-.4.3-.5.5z"
              />
            </svg>
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
            <svg width="24" height="24" aria-hidden="true" focusable="false">
              <circle cx="12" cy="5.4" r="2.5" />
              <circle cx="12" cy="12" r="2.5" />
              <circle cx="12" cy="18.6" r="2.5" />
            </svg>
          </button>
          <div hidden={!state.isSettingsOpen} id={`${appState.id}-settings`} className={styles.popover}>
            <button
              hidden
              className={styles.button}
              aria-label="Convert JSON animation to dotLottie format"
            >
              <svg
                width="24"
                height="24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M17.016 17.016v-4.031h1.969v6h-12v3l-3.984-3.984 3.984-3.984v3h10.031zM6.984 6.984v4.031H5.015v-6h12v-3l3.984 3.984-3.984 3.984v-3H6.984z"
                />
              </svg>
              Convert to dotLottie
            </button>
            <button
              className={styles.button}
              aria-label="Download still image"
              onClick={() => snapshot(true)}
            >
              <svg
                width="24"
                height="24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M16.8 10.8 12 15.6l-4.8-4.8h3V3.6h3.6v7.2h3zM12 15.6H3v4.8h18v-4.8h-9zm7.8 2.4h-2.4v-1.2h2.4V18z"
                />
              </svg>
              Download still image
            </button>
          </div>
        </>
      }
    </div>
  )
}