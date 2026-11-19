import type * as DotLottie from '@aarsteinmedia/lottie-web/dotlottie'

let dotLottieModulePromise: Promise<typeof DotLottie> | undefined

export const getDotLottieModule = () => {
  dotLottieModulePromise = dotLottieModulePromise ?? import('@aarsteinmedia/lottie-web/dotlottie')

  return dotLottieModulePromise
}
