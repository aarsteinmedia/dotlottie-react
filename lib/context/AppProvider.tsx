/* eslint-disable @typescript-eslint/naming-convention */
import { createElementID } from '@aarsteinmedia/lottie-web/utils'
import { useEffect, useReducer } from 'react'

import AppContext, { type PlayerConfig } from '@/context/AppContext'
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

  return (
    <AppContext value={{
      dispatch,
      state
    }}>
      {children}
    </AppContext>
  )
}