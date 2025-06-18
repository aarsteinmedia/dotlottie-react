import type { LottieManifest } from '@aarsteinmedia/lottie-web'

import type { AnimationAttributes } from '@/types'

import { handleErrors } from '@/utils'
import createDotLottie from '@/utils/createDotLottie'
import getAnimationData from '@/utils/getAnimationData'

/**
 * Creates a new dotLottie file, by combinig several animations.
 * If set to false the function returns an ArrayBuffer. Defaults to true.
 */
export default async function addAnimation ({
  configs,
  fileName,
  generator,
  id,
  shouldDownload = true,
  src,
}: {
  configs: AnimationAttributes[]
  src?: string
  id?: string
  fileName?: string
  shouldDownload?: boolean
  generator: string
}): Promise<{
    result?: null | ArrayBuffer
    success: boolean
    error?: string
  }> {

  /**
   * Initialize meta object for animation, with fallbacks for
   * when the method is called indepenently.
   */
  const {
    animations = [],
    manifest = {
      animations: src
        ? [
          { id },
        ]
        : [],
    } as LottieManifest,
  } = src ? await getAnimationData(src) : {}

  try {
    if (!manifest) {
      throw new Error('Manifest is not set')
    }
    manifest.generator = generator
    const { length } = configs

    for (let i = 0; i < length; i++) {
      const { url } = configs[i],
        { animations: animationsToAdd } = await getAnimationData(url)

      if (!animationsToAdd) {
        throw new Error('No animation loaded')
      }
      if (manifest.animations.some((anim) => anim.id === configs[i].id)) {
        throw new Error('Duplicate id for animation')
      }

      manifest.animations = [...manifest.animations, { id: configs[i].id }]

      animations.push(...animationsToAdd)
    }

    return {
      result: await createDotLottie({
        animations,
        fileName,
        manifest,
        shouldDownload,
      }),
      success: true,
    }
  } catch (error) {
    return {
      error: handleErrors(error).message,
      success: false,
    }
  }
}