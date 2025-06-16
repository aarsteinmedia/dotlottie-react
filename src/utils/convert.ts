import type { LottieManifest } from '@aarsteinmedia/lottie-web'

import type { ConvertParams } from '@/types'

import { getFilename } from '@/utils'
import createDotLottie from '@/utils/createDotLottie'
import createJSON from '@/utils/createJSON'
import getAnimationData from '@/utils/getAnimationData'

export default async function convert ({
  animations: animationsFromProps,
  fileName,
  generator,
  isDotLottie,
  manifest,
  shouldDownload = true,
  src,
  typeCheck
}: ConvertParams) {
  const toConvert = src

  if (!toConvert && !animationsFromProps?.length) {
    throw new Error('No animation to convert')
  }

  let animations = animationsFromProps

  if (!animations) {
    const animationData = await getAnimationData(toConvert)

    animations = animationData.animations
  }

  if (typeCheck || isDotLottie) {

    return createJSON({
      animation: animations?.[0],
      fileName: `${getFilename(fileName || toConvert || 'converted')}.json`,
      shouldDownload,
    })
  }

  return createDotLottie({
    animations,
    fileName: `${getFilename(fileName || toConvert || 'converted')}.lottie`,
    manifest: {
      ...manifest ?? manifest,
      generator,
    } as LottieManifest,
    shouldDownload,
  })
}