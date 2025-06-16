'use client'

import type { AnimationDirection } from '@aarsteinmedia/lottie-web'

import {
  namespaceSVG, PlayerEvents, PlayMode, PreserveAspectRatio, RendererType
} from '@aarsteinmedia/lottie-web/utils'
import {
  use, useRef, useState
} from 'react'

import ErrorMessage from '@/components/ErrorMessage'
import AppContext from '@/context/AppContext'
import styles from '@/styles.module.css'
import { PlayerState } from '@/utils/enums'

const generator = '@aarsteinmedia/dotlottie-react'

/**
 * DotLottie Player Web Component.
 */
export default function Player({
  background,
  count = 0,
  description,
  direction = 1,
  hover,
  intermission,
  mode = PlayMode.Normal,
  objectFit = 'contain',
  renderer = RendererType.SVG,
  speed = 1,
  subframe
}: {
  background?: string
  count?: number
  description?: string
  direction?: AnimationDirection,
  hover?: boolean
  intermission?: number
  mode?: PlayMode,
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  renderer?: RendererType
  speed?: number,
  subframe?: boolean
}){

  const { appState, setAppState } = use(AppContext),
    [state, setState] = useState({ errorMessage: 'Unknown error' }),
    container = useRef<HTMLElement>(null)

  return (
    <div className={styles.dotLottie} lang={appState.lang} aria-label={description}>
      <figure className={styles.animation} ref={container} style={{ background }}>
        {appState.playerState === PlayerState.Error &&
          <div className={styles.error}>
            <ErrorMessage message={state.errorMessage} />
          </div>
        }
      </figure>
    </div>
  )
}
