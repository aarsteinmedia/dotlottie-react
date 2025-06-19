# AM LottiePlayer React

![Awesome Vector Animations](/.github/readmeBanner.svg)

This is a reworked verson of [@aarsteinmedia/dotlottie-player](https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player) – with the same functionality, but made to work natively with React.

## Installation

```shell
pnpm add @aarsteinmedia/dotlottie-react
```

## Usage

Import the component and use it in your markup, like any other React component.

```jsx
import DotLottiePlayer '@aarsteinmedia/dotlottie-react'

export default function App() {
  return (
    <DotLottiePlayer
      className="your-class-name"
      src="https://storage.googleapis.com/aarsteinmedia/am.lottie"
      autoplay
      controls
      loop
      style={{
        width: '320px',
        margin: 'auto'
      }}
    />
  )
}
```

### With TypeScript and `ref`

If you're using TypeScript and `ref` you can do something like this:

```tsx
import { useRef } from 'react'

import DotLottiePlayer, { type DotLottieMethods } '@aarsteinmedia/dotlottie-react'

export default function App() {
  const animation = useRef<DotLottieMethods>(null)

  return (
    <DotLottiePlayer
      src="https://storage.googleapis.com/aarsteinmedia/am.lottie"
      ref={animation}
      onMouseEnter={() => animation.current?.play()}
      onMouseLeave={() => animation.current?.stop()}
    />
  )
}
```

## Attributes

| Attribute                 | Description                                                                                                                   | Type                                     | Default           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------- |
| `animateOnScroll`         | Play animation by scrolling                                                                                                   | `boolean`                                | `false`           |
| `autoplay`                | Play animation on load                                                                                                        | `boolean`                                | `false`           |
| `background`              | Background color                                                                                                              | `string`                                 | `undefined`       |
| `controls`                | Show controls                                                                                                                 | `boolean`                                | `false`           |
| `count`                   | Number of times to loop animation                                                                                             | `number`                                 | `undefined`       |
| `direction`               | Direction of animation                                                                                                        | `1` \| `-1`                              | `1`               |
| `hover`                   | Whether to play on mouse hover                                                                                                | `boolean`                                | `false`           |
| `loop`                    | Whether to loop animation                                                                                                     | `boolean`                                | `false`           |
| `mode`                    | Play mode                                                                                                                     | `normal` \| `bounce`                     | `normal`          |
| `objectFit`               | Resizing of animation in container                                                                                            | `contain` \| `cover` \| `fill` \| `none` | `contain`         |
| `renderer`                | Renderer to use                                                                                                               | `svg` \| `canvas` \| `html`              | `svg`             |
| `speed`                   | Animation speed                                                                                                               | `number`                                 | `1`               |
| `src`                     | URL to LottieJSON or dotLottie                                                                                                | `string`                                 | `undefined`       |
| `subframe`                | When enabled this can help to reduce flicker on some animations, especially on Safari and iOS devices.                        | `boolean`                                | `false`           |


## Methods

The following methods are exposed via `useRef` hook.

| Method                                                          | Function
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `addAnimation(params: AddAnimationParams) => Promise<Result>`   | Add animation. Triggers download of new dotLottie file.                                                   |
| `convert(params: ConvertParams) => Promise<Result>`             | If the current animation is in JSON format – convert it to dotLottie. Triggers a download in the browser. |
| `load(src: string \| null) => Promise<void>`                    | Load animation by URL or JSON object                                                                      |
| `next() => void`                                                | Next animation (if several in file)                                                                       |
| `pause() => void`                                               | Pause                                                                                                     |
| `play() => void`                                                | Play                                                                                                      |
| `previous() => void`                                            | Previous animation (if several in file)                                                                   |
| `seek(value: number \| string) => void`                         | Go to frame. Can be a number or a percentage string (e. g. 50%).                                          |
| `setCount(value: number) => void`                               | Dynamically set number of loops                                                                           |
| `setDirection(value: AnimationDirection) => void`               | Set Direction                                                                                             |
| `setLoop(value: boolean) => void`                               | Set Looping                                                                                               |
| `setMultiAnimationSettings(value: AnimationSettings[]) => void` | Set Multi-animation settings                                                                              |
| `setSegment(value: AnimationSegment) => void`                   | Play only part of an animation. E. g. from frame 10 to frame 60 would be `[10, 60]`                       |
| `setSpeed(value: number) => void`                               | Set Speed                                                                                                 |
| `setSubframe(value: boolean) => void`                           | Set subframe                                                                                              |
| `stop() => void`                                                | Stop                                                                                                      |


## License

GPL-2.0-or-later