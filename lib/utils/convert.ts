import type { LottieManifest } from '@aarsteinmedia/lottie-web'

import type { ConvertParams, Result } from '@/types'

import { getFilename, handleErrors } from '@/utils'
import createDotLottie from '@/utils/createDotLottie'
import createJSON from '@/utils/createJSON'
import getAnimationData from '@/utils/getAnimationData'

export default async function convert ({
  animations: animationsFromProps,
  currentAnimation = 0,
  fileName: fileNameFromProps,
  generator,
  isDotLottie,
  manifest,
  shouldDownload = true,
  src,
  typeCheck
}: ConvertParams): Promise<Result> {
  try {
    const toConvert = src

    if (!toConvert && !animationsFromProps?.length) {
      throw new Error('No animation to convert')
    }

    let animations = animationsFromProps

    if (!animations) {
      const animationData = await getAnimationData(toConvert)

      animations = animationData.animations ?? []
    }

    if (typeCheck || isDotLottie) {

      let fileName = getFilename(fileNameFromProps || toConvert || 'converted')

      if (animations.length > 1) {
        fileName += `-${currentAnimation + 1}`
      }

      fileName += '.json'

      return {
        result: createJSON({
          animation: animations[currentAnimation],
          fileName,
          shouldDownload,
        }),
        success: true
      }
    }

    return {
      result: await createDotLottie({
        animations,
        fileName: `${getFilename(fileNameFromProps || toConvert || 'converted')}.lottie`,
        manifest: {
          ...manifest ?? manifest,
          generator,
        } as LottieManifest,
        shouldDownload,
      }),
      success: true
    }
  } catch (error) {
    return {
      error: handleErrors(error).message,
      success: false,
    }
  }
}