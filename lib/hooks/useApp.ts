import { use } from 'react'

import AppContext from '@/context/AppContext'

export default function useApp() {
  return use(AppContext)
}