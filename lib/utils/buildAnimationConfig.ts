import type { AnimationConfiguration, CanvasRendererConfig } from '@aarsteinmedia/lottie-web'

import type { AppState } from '@/types'
import type { ObjectFit } from '@/utils/enums'

import { RendererType } from '@/enums'
import { aspectRatio } from '@/utils'
import { hasReducedMotion } from '@/utils/constants'

export function buildAnimationConfig(
  container: HTMLElement,
  state: AppState,
  objectFit: ObjectFit,
  renderer: RendererType
): AnimationConfiguration {
  const {
      asset, config, playback
    } = state,
    preserveAspectRatio =
    aspectRatio(objectFit),
    currentAnimationSettings = asset.multiAnimationSettings.length > 0
      ? asset.multiAnimationSettings[playback.currentAnimation]
      : undefined,
    currentAnimationManifest =
      asset.manifest?.animations[playback.currentAnimation]

  // Loop
  let hasLoop = Boolean(config.loop)

  if (
    currentAnimationManifest?.loop !== undefined
  ) {
    hasLoop = Boolean(currentAnimationManifest.loop)
  }
  if (currentAnimationSettings?.loop !== undefined) {
    hasLoop = Boolean(currentAnimationSettings.loop)
  }

  // Autoplay
  let hasAutoplay = !hasReducedMotion && Boolean(config.autoplay)

  if (!hasReducedMotion) {
    if (
      currentAnimationManifest?.autoplay !== undefined
    ) {
      hasAutoplay = Boolean(currentAnimationManifest.autoplay)
    }
    if (currentAnimationSettings?.autoplay !== undefined) {
      hasAutoplay = Boolean(currentAnimationSettings.autoplay)
    }
    if (config.animateOnScroll) {
      hasAutoplay = false
    }
  }

  // Segment
  let initialSegment = playback.segment ?? undefined

  if (playback.segment?.every((val) => val > 0)) {
    initialSegment = [playback.segment[0] - 1, playback.segment[1] - 1]
  }
  if (playback.segment?.some((val) => val < 0)) {
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