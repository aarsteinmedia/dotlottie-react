import { useEffect } from 'react'

export default function useDidComponentMount(effect: React.EffectCallback) {
  useEffect(() => {
    effect()
  }, [])
}