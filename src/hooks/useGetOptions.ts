/**
 * Get options from props.
 */
export default function useGetOptions() {
  if (!container.current) {
    throw new Error('Container not rendered')
  }
  const preserveAspectRatio = aspectRatio(objectFit as ObjectFit),
    currentAnimationSettings = state.multiAnimationSettings.length > 0
      ? state.multiAnimationSettings[state.currentAnimation]
      : undefined,
    currentAnimationManifest =
      state.manifest?.animations[state.currentAnimation]

  // Loop
  let hasLoop = Boolean(loop)

  if (
    currentAnimationManifest?.loop !== undefined
  ) {
    hasLoop = Boolean(currentAnimationManifest.loop)
  }
  if (currentAnimationSettings?.loop !== undefined) {
    hasLoop = Boolean(currentAnimationSettings.loop)
  }

  // Autoplay
  let hasAutoplay = Boolean(appState.autoplay)

  if (
    currentAnimationManifest?.autoplay !== undefined
  ) {
    hasAutoplay = Boolean(currentAnimationManifest.autoplay)
  }
  if (currentAnimationSettings?.autoplay !== undefined) {
    hasAutoplay = Boolean(currentAnimationSettings.autoplay)
  }
  if (animateOnScroll) {
    hasAutoplay = false
  }

  // Segment
  let initialSegment = state.segment

  if (state.segment?.every((val) => val > 0)) {
    initialSegment = [state.segment[0] - 1, state.segment[1] - 1]
  }
  if (state.segment?.some((val) => val < 0)) {
    initialSegment = undefined
  }

  const options: AnimationConfiguration<
    RendererType.SVG | RendererType.Canvas | RendererType.HTML
  > = {
    autoplay: hasAutoplay,
    container: container.current,
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
        // @ts-expect-error TODO:
        clearCanvas: true,
        preserveAspectRatio,
        progressiveLoad: true,
      }
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