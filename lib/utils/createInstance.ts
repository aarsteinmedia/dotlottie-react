import type {
  AnimationConfiguration, AnimationData, AnimationItem
} from '@aarsteinmedia/lottie-web'

import type { UseLottieInstance } from '@/types'

export function createInstance(
  loadAnimation: UseLottieInstance['loadAnimation'],
  animationRef: React.RefObject<null | AnimationItem>,
  config: AnimationConfiguration,
  animationData: AnimationData
): AnimationItem {
  animationRef.current?.destroy()

  const item = loadAnimation({
    ...config,
    animationData
  })

  animationRef.current = item

  return item
}