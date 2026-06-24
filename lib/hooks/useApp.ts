import { use } from 'react'

import AppContext from '@/context/AppContext'

export function useApp() {
  return use(AppContext)
}