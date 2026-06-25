import type { AnimationItem } from '@aarsteinmedia/lottie-web'

export function getSeeker(animationItem: AnimationItem): number {
  const { currentFrame, totalFrames } = animationItem

  if (totalFrames <= 0) {
    return 0
  }

  return Math.round(currentFrame / totalFrames * 100)
}
