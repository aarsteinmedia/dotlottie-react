import type {
  AnimationData, AnimationDirection, AnimationSegment, AnimationSettings, LottieManifest
} from '@aarsteinmedia/lottie-web'

interface AnimationAttributes extends AnimationSettings {
  id: string
  url: string
}

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

export interface AddAnimationParams {
  configs: AnimationAttributes[]
  fileName?: string
  generator: string
  id?: string
  shouldDownload?: boolean
  src?: string
}

export interface Result {
  error?: string
  result?: null | string | ArrayBuffer
  success: boolean
}

export interface DotLottieMethods {
  addAnimation: (params: AddAnimationParams) => Promise<Result>
  convert: (params: ConvertParams) => Promise<Result>
  getIsVisible: () => boolean
  load: (src: string | null) => Promise<void>
  next: () => void
  pause: () => void
  play: () => void
  previous: () => void
  seek: (value: number | string) => void
  setCount: (value: number) => void
  setDirection: (value: AnimationDirection) => void
  setLoop: (value: boolean) => void
  setMultiAnimationSettings: (settings: AnimationSettings[]) => void
  setSegment: (value: AnimationSegment) => void
  setSpeed: (value: number) => void
  setSubframe: (value: boolean) => void
  stop: () => void
}