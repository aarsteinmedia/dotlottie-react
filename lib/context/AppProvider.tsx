import { PlayMode, createElementID } from '@aarsteinmedia/lottie-web/utils'
import { useState } from 'react'

import AppContext, { defaultValue, type AppState } from '@/context/AppContext'

export default function AppProvider({
  animateOnScroll,
  autoplay,
  children,
  controls,
  id,
  loop,
  loopsCompleted = 0,
  mode = PlayMode.Normal,
  simple,
  src = null
}: Readonly<Partial<AppState> & { children: React.ReactNode }>) {
  const [appState, setAppState] = useState<AppState>({
    ...defaultValue,
    animateOnScroll,
    autoplay,
    controls,
    id: id ?? createElementID(),
    loop,
    loopsCompleted,
    mode,
    simple,
    src
  })

  return <AppContext value={{
    appState,
    setAppState
  }}>{children}</AppContext>
}