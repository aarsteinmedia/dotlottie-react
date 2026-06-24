import { use } from 'react'

import AppContext, { type PlayerSnapshot } from '@/context/AppContext'

/**
* Migration function.
*
* @deprecated The method should not be used.
*/
export function useApp() {
  const { dispatch, state } = use(AppContext),

    appState: PlayerSnapshot = {
      ...state.config,
      ...state.asset,
      ...state.playback
    },

    setAppState = (updater: PlayerSnapshot | ((prev: PlayerSnapshot) => PlayerSnapshot)) => {
      const prev = appState,
        next = typeof updater === 'function' ? updater(prev) : updater

      dispatch({
        patch: {
          animateOnScroll: next.animateOnScroll,
          autoplay: next.autoplay,
          controls: next.controls,
          id: next.id,
          lang: next.lang,
          loop: next.loop,
          mode: next.mode,
          simple: next.simple,
          src: next.src
        },
        type: 'SYNC_CONFIG'
      })

      dispatch({
        patch: {
          currentAnimation: next.currentAnimation,
          errorMessage: next.errorMessage,
          loopsCompleted: next.loopsCompleted,
          playerState: next.playerState,
          prevState: next.prevState,
          seeker: next.seeker,
          segment: next.segment
        },
        type: 'SET_PLAYBACK'
      })

      if (next.multiAnimationSettings !== prev.multiAnimationSettings) {
        dispatch({
          settings: next.multiAnimationSettings,
          type: 'SET_MULTI_ANIMATION_SETTINGS'
        })
      }

      if (
        next.animations !== prev.animations ||
        next.isDotLottie !== prev.isDotLottie ||
        next.manifest !== prev.manifest
      ) {
        //
      }
    }

  return {
    appState,
    dispatch,
    setAppState,
    state
  }
}

export function usePlayerAsset() {
  return use(AppContext).state.asset
}

export function usePlayerConfig() {
  return use(AppContext).state.config
}

export function usePlayerPlayback() {
  return use(AppContext).state.playback
}

export function usePlayerDispatch() {
  return use(AppContext).dispatch
}