import type { AnimationConfiguration, CanvasRendererConfig } from '@aarsteinmedia/lottie-web'

import type { PlayerSnapshot } from '@/context/AppContext'
import type { ObjectFit } from '@/utils/enums'

import { RendererType } from '@/enums'
import { aspectRatio } from '@/utils'
import { hasReducedMotion } from '@/utils/constants'

export function buildAnimationConfig(
  container: HTMLElement,
  snapshot: PlayerSnapshot,
  objectFit: ObjectFit,
  renderer: RendererType
): AnimationConfiguration {
  const preserveAspectRatio =
    aspectRatio(objectFit),
    currentAnimationSettings = snapshot.multiAnimationSettings.length > 0
      ? snapshot.multiAnimationSettings[snapshot.currentAnimation]
      : undefined,
    currentAnimationManifest =
      snapshot.manifest?.animations[snapshot.currentAnimation]

  // Loop
  let hasLoop = Boolean(snapshot.loop)

  if (
    currentAnimationManifest?.loop !== undefined
  ) {
    hasLoop = Boolean(currentAnimationManifest.loop)
  }
  if (currentAnimationSettings?.loop !== undefined) {
    hasLoop = Boolean(currentAnimationSettings.loop)
  }

  // Autoplay
  let hasAutoplay = !hasReducedMotion && Boolean(snapshot.autoplay)

  if (!hasReducedMotion) {
    if (
      currentAnimationManifest?.autoplay !== undefined
    ) {
      hasAutoplay = Boolean(currentAnimationManifest.autoplay)
    }
    if (currentAnimationSettings?.autoplay !== undefined) {
      hasAutoplay = Boolean(currentAnimationSettings.autoplay)
    }
    if (snapshot.animateOnScroll) {
      hasAutoplay = false
    }
  }

  // Segment
  let initialSegment = snapshot.segment ?? undefined

  if (snapshot.segment?.every((val) => val > 0)) {
    initialSegment = [snapshot.segment[0] - 1, snapshot.segment[1] - 1]
  }
  if (snapshot.segment?.some((val) => val < 0)) {
    initialSegment = undefined
  }

  const options: AnimationConfiguration = {
    autoplay: hasAutoplay,
    container,
    initialSegment,
    loop: hasLoop,
    renderer,
    rendererSettings: { imagePreserveAspectRatio: preserveAspectRatio },
  }

  switch (renderer) {
    case RendererType.SVG: {
      options.rendererSettings = {
        ...options.rendererSettings,
        hideOnTransparent: true,
        preserveAspectRatio,
        progressiveLoad: true,
      }
      break
    }
    case RendererType.Canvas: {
      options.rendererSettings = {
        ...options.rendererSettings,
        clearCanvas: true,
        preserveAspectRatio,
        progressiveLoad: true,
      } as CanvasRendererConfig
      break
    }
    case RendererType.HTML: {
      options.rendererSettings = {
        ...options.rendererSettings,
        hideOnTransparent: true,
      }
    }
  }

  return options
}