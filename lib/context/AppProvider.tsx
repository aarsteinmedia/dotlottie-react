/* eslint-disable @typescript-eslint/naming-convention */
import { createElementID } from '@aarsteinmedia/lottie-web/utils'
import {
  useEffect, useReducer, useRef
} from 'react'

import {
  PlayerDispatchContext, PlayerStateContext, PlayerStateRefContext, type PlayerConfig
} from '@/context/AppContext'
import { createInitialState, playerReducer } from '@/context/playerReducer'

type Props = Readonly<PlayerConfig> & { children: React.ReactNode }

export default function AppProvider(props: Props) {
  const [state, dispatch] = useReducer(
      playerReducer,
      props,
      initialProps => createInitialState({
        ...initialProps,
        id: initialProps.id ?? createElementID(),
        src: initialProps.src ?? null
      })
    ),
    stateRef = useRef(state),

    {
      animateOnScroll,
      autoplay,
      children,
      controls,
      id,
      loop,
      mode,
      simple,
      src
    } = props

  useEffect(() => {
    dispatch({
      patch: {
        animateOnScroll,
        autoplay,
        controls,
        loop,
        mode,
        simple,
        src: src ?? null,
        ...id ? { id } : {}
      },
      type: 'SYNC_CONFIG'
    })
  }, [
    animateOnScroll,
    autoplay,
    controls,
    id,
    loop,
    mode,
    simple,
    src
  ])
  useEffect(() => {
    stateRef.current = state
  }, [state])

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