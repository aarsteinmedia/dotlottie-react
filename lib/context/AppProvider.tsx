'use client'
import { createElementID } from '@aarsteinmedia/lottie-web/utils'
import { useState } from 'react'

import AppContext, { defaultValue, type AppState } from '@/context/AppContext'

export default function AppProvider({
  animateOnScroll,
  autoplay,
  children,
  controls,
  count = 0,
  id,
  loop,
  simple,
  src = null
}: Readonly<Partial<AppState> & { children: React.ReactNode }>) {
  const [appState, setAppState] = useState<AppState>(() => ({
    ...defaultValue,
    animateOnScroll,
    autoplay,
    controls,
    count,
    id: id ?? createElementID(),
    loop,
    simple,
    src
  }))

  return <AppContext value={{
    appState,
    setAppState
  }}>{children}</AppContext>
}