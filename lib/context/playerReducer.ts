import { PlayMode } from '@aarsteinmedia/lottie-web/utils'

import type { PlayerConfig } from '@/context/AppContext'
import type { AppState, PlayerAction } from '@/types'

import { PlayerState } from '@/utils/enums'

export function playerReducer(state: AppState, action: PlayerAction) {
  switch (action.type) {
    case 'LOAD_ERROR': {
      return {
        ...state,
        playback: {
          ...state.playback,
          errorMessage: action.errorMessage,
          playerState: PlayerState.Error
        }
      }
    }
    case 'LOAD_START': {
      return {
        ...state,
        config: {
          ...state.config,
          src: action.src
        },
        playback: {
          ...state.playback,
          errorMessage: 'Failed to load file',
          playerState: PlayerState.Loading,
          prevState: state.playback.playerState
        }
      }
    }
    case 'LOAD_SUCCESS': {
      return {
        ...state,
        asset: {
          ...state.asset,
          animations: action.payload.animations,
          isDotLottie: action.payload.isDotLottie,
          manifest: action.payload.manifest
        },
        config: {
          ...state.config,
          mode: action.payload.mode
        },
        playback: {
          ...state.playback,
          loopsCompleted: 0,
          playerState: action.payload.playerState,
          seeker: 0
        }
      }
    }
    case 'SET_MULTI_ANIMATION_SETTINGS': {
      return {
        ...state,
        asset: {
          ...state.asset,
          multiAnimationSettings: action.settings
        }
      }
    }
    case 'SET_PLAYBACK': {
      return {
        ...state,
        playback: {
          ...state.playback,
          ...action.patch
        }
      }
    }
    case 'SET_SEGMENT': {
      return {
        ...state,
        playback: {
          ...state.playback,
          segment: action.segment
        }
      }
    }
    case 'SWITCH_ANIMATION': {
      return {
        ...state,
        config: action.mode === undefined ? state.config : {
          ...state.config,
          mode: action.mode
        },
        playback: {
          ...state.playback,
          currentAnimation: action.currentAnimation
        }
      }
    }
    case 'SYNC_CONFIG': {
      return {
        ...state,
        config: {
          ...state.config,
          ...action.patch
        }
      }
    }
    default: {
      return state
    }
  }
}

export function createInitialState(config: Partial<PlayerConfig> = {}): AppState {
  return {
    asset: {
      animations: [],
      isDotLottie: false,
      multiAnimationSettings: []
    },
    config: {
      lang: 'en',
      mode: PlayMode.Normal,
      ...config,
      src: config.src ?? null
    },
    playback: {
      currentAnimation: 0,
      errorMessage: 'Failed to load file',
      loopsCompleted: 0,
      playerState: PlayerState.Loading,
      prevState: PlayerState.Loading,
      seeker: 0,
      segment: null
    }
  }
}