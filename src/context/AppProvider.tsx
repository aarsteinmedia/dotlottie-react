'use client'
import { createElementID } from '@aarsteinmedia/lottie-web/utils'
import { useState } from 'react'

import AppContext, { defaultValue, type AppState } from '@/context/AppContext'

export default function AppProvider({
  animateOnScroll,
  autoplay,
  children,
  controls,
  id,
  loop,
  simple,
  src
}: Readonly<AppState & { children: React.ReactNode }>) {
  const [appState, setAppState] = useState<AppState>(() => ({
    ...defaultValue,
    animateOnScroll,
    autoplay,
    controls,
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