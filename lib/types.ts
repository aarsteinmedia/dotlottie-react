import type {
  AddAnimationParams,
  AnimationDirection, AnimationSegment, AnimationSettings,
  ConvertParams,
  Result
} from '@aarsteinmedia/lottie-web'

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