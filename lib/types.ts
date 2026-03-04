import type {
  AnimationDirection,
  AnimationSegment,
  AnimationSettings,
} from '@aarsteinmedia/lottie-web'
import type {
  addAnimation,
  convert,
} from '@aarsteinmedia/lottie-web/dotlottie'

export interface DotLottieMethods {
  addAnimation: (
    ...args: Parameters<typeof addAnimation>
  ) => ReturnType<typeof addAnimation>
  convert: (
    ...args: Parameters<typeof convert>
  ) => ReturnType<typeof convert>
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