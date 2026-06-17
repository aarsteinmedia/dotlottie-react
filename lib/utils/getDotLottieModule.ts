let dotLottieModulePromise: Promise<typeof import('@aarsteinmedia/lottie-web/dotlottie')> | undefined

export const getDotLottieModule = () => {
  dotLottieModulePromise = dotLottieModulePromise ?? import('@aarsteinmedia/lottie-web/dotlottie')

  return dotLottieModulePromise
}