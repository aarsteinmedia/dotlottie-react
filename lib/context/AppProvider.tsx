/* eslint-disable @typescript-eslint/naming-convention */
import { createElementID } from '@aarsteinmedia/lottie-web/utils'
import {
  useCallback,
  useEffect, useRef,
  useState
} from 'react'

import type { PlayerAction } from '@/types'

import {
  PlayerDispatchContext, PlayerStateContext, PlayerStateRefContext, type PlayerConfig
} from '@/context/AppContext'
import { createInitialState, playerReducer } from '@/context/playerReducer'

type Props = Readonly<PlayerConfig> & { children: React.ReactNode }

export default function AppProvider(props: Props) {
  const [state, setState] = useState(() => createInitialState({
      ...props,
      id: props.id ?? createElementID(),
      src: props.src ?? null
    })),
    stateRef = useRef(state),

    dispatch = useCallback((action: PlayerAction) => {
      const next = playerReducer(stateRef.current, action)

      if (next === stateRef.current) {
        return
      }

      stateRef.current = next
      setState(next)
    }, [setState]),

    {
      animateOnScroll,
      autoplay,
      children,
      controls,
      id,
      loop,
      mode,
      renderer,
      simple,
      src,
      subframe
    } = props

  useEffect(() => {
    dispatch({
      patch: {
        animateOnScroll,
        autoplay,
        controls,
        loop,
        mode,
        renderer,
        simple,
        src: src ?? null,
        subframe,
        ...id ? { id } : {}
      },
      type: 'SYNC_CONFIG'
    })
  }, [animateOnScroll,
    autoplay,
    controls,
    dispatch,
    id,
    loop,
    mode,
    renderer,
    simple,
    src,
    subframe])

  return (
    <PlayerDispatchContext value={dispatch}>
      <PlayerStateRefContext value={stateRef}>
        <PlayerStateContext value={state}>
          {children}
        </PlayerStateContext>
      </PlayerStateRefContext>
    </PlayerDispatchContext>
  )
}