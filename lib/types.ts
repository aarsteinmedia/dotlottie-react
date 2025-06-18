import type {
  AnimationData, AnimationSettings, LottieManifest
} from '@aarsteinmedia/lottie-web'

export interface Animation extends AnimationSettings { id: string }

export interface AnimationAttributes extends Animation { url: string }

export interface ConvertParams {
  /** Externally added animations. */
  animations?: AnimationData[]

  currentAnimation?: number

  fileName?: string
  generator?: string

  isDotLottie?: boolean

  /** Externally added manifest. */
  manifest?: LottieManifest

  /** Whether to trigger a download in the browser. Defaults to true. */
  shouldDownload?: boolean

  src?: string

  /** External type safety. */
  typeCheck?: boolean
}