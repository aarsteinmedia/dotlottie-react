import type { AnimationItem } from '@aarsteinmedia/lottie-web'

export function getSeeker(animationItem: null | AnimationItem): number {
  const { currentFrame, totalFrames } = animationItem ?? {
    currentFrame: 0,
    totalFrames: 0
  }

  if (totalFrames <= 0) {
    return 0
  }

  return Math.round(currentFrame / totalFrames * 100)
}
