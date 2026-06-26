# dotLottie React

![Awesome Vector Animations](/.github/readmeBanner.svg)

A React player for Lottie JSON and [dotLottie](https://dotlottie.io/) files. This package is a rework of [@aarsteinmedia/dotlottie-player](https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player), rebuilt for React with a modern hook-based architecture.

Requires **React 19**.

## Installation

```shell
pnpm add @aarsteinmedia/dotlottie-react
# or: npm install @aarsteinmedia/dotlottie-react
# or: yarn add @aarsteinmedia/dotlottie-react
```

## Quick start

```tsx
import DotLottiePlayer from '@aarsteinmedia/dotlottie-react'

export default function App() {
  return (
    <DotLottiePlayer
      className="your-class-name"
      src="https://storage.googleapis.com/aarsteinmedia/am.lottie"
      autoplay
      controls
      loop
      style={{ width: 320, margin: 'auto' }}
    />
  )
}
```

## Entry points

| Import | Use when |
| ------ | -------- |
| `@aarsteinmedia/dotlottie-react` | Default build with full renderer support (SVG, Canvas), support for expressions and effects (blur, drop shadow, etc.) |
| `@aarsteinmedia/dotlottie-react/light` | Smaller bundle; SVG renderer only, no expressions and no effects |
| `@aarsteinmedia/dotlottie-react/enums` | `PlayerState`, `ObjectFit`, `PlayMode`, `RendererType` |
| `@aarsteinmedia/dotlottie-react/styles.css` | Rarely needed directly; styles load automatically with the player entries |

```tsx
import DotLottiePlayer from '@aarsteinmedia/dotlottie-react/light'
```

## TypeScript and refs

In React 19, `ref` is a regular prop:

```tsx
import { useRef } from 'react'

import DotLottiePlayer, { type DotLottieMethods } from '@aarsteinmedia/dotlottie-react'

export default function App() {
  const player = useRef<DotLottieMethods>(null)

  return (
    <DotLottiePlayer
      src="https://storage.googleapis.com/aarsteinmedia/am.lottie"
      ref={player}
      onMouseEnter={() => player.current?.play()}
      onMouseLeave={() => player.current?.stop()}
    />
  )
}
```

For the effect in the above example you can also use the `hover` attribute.

Exported types: `DotLottieProps`, `DotLottieMethods`.
Enum types: `ObjectFit`, `PlayerState`, `PlayMode` and `RendererType` are exported from `@aarsteinmedia/dotlottie-react/enums`

## Next.js (App Router)
This is a client component, howver both entries ship with `'use client'` directive, so it is safe to use in server context.

## Props

Standard HTML attributes (for example `className`, `style`, `id`) are forwarded to the root element.

| Prop | Description | Type | Default |
| ---- | ----------- | ---- | ------- |
| `src` | URL to a `.json` or `.lottie` file | `string` | — |
| `autoplay` | Start playing when loaded | `boolean` | `false` |
| `lang` | Language, for accessibility | `string` | `en` |
| `loop` | Loop the animation | `boolean` | `false` |
| `loopLimit` | Stop after N loops (`0` = unlimited) | `number` | `0` |
| `controls` | Show the built-in control bar | `boolean` | `false` |
| `simple` | Minimal control bar (play, stop, seek only) | `boolean` | `false` |
| `direction` | Playback direction | `1` \| `-1` | `1` |
| `speed` | Playback speed multiplier | `number` | `1` |
| `mode` | Normal or bounce (boomerang) playback | `normal` \| `bounce` | `normal` |
| `renderer` | Rendering backend | `svg` \| `canvas`* | `svg` |
| `objectFit` | How the animation fits its container | `contain` \| `cover` \| `fill` \| `none` \| `scale-down` | `contain` |
| `background` | Background color of the animation area | `string` | — |
| `description` | Accessible label for the player | `string` | — |
| `hover` | Play on mouse enter, stop on mouse leave | `boolean` | `false` |
| `intermission` | Delay in ms between bounce loops | `number` | — |
| `animateOnScroll` | Scrub the animation based on page scroll | `boolean` | `false` |
| `subframe` | Sub-frame rendering (can reduce flicker on Safari/iOS) | `boolean` | `false` |
| `onFrame` | Called when animation enters new frame | `(detail: {frame: number; seeker: number}) => void` | — |
| `onLoad` | Called when the animation DOM is ready | `() => void` | — |
| `onLoop` | Called when a loop is finished | `() => void` | — |
| `onComplete` | Called when playback completes | `() => void` | — |
| `onError` | Called on load or playback errors | `(message?: string) => void` | — |
| `ref` | Imperative API (see below) | `Ref<DotLottieMethods \| null>` | — |

*`canvas` requires the default import.

## Imperative methods

Access via `ref`:

| Method | Description |
| ------ | ----------- |
| `play()` | Start or resume playback |
| `pause()` | Pause playback |
| `stop()` | Stop and reset loop counter |
| `seek(value)` | Jump to frame number or percentage (e.g. `"50%"`) |
| `async load(src)` | Load a new animation URL |
| `next()` / `previous()` | Switch animation in multi-animation files |
| `setSpeed(value)` | Set playback speed |
| `setDirection(value)` | Set direction (`1` or `-1`) |
| `setLoop(value)` | Enable or disable looping on the active instance |
| `setLoopsCompleted(value)` | Set the internal loop counter |
| `setSegment(segment)` | Play a frame range, e.g. `[10, 60]` |
| `setSubframe(value)` | Toggle sub-frame rendering |
| `setMultiAnimationSettings(settings)` | Per-animation settings for multi-animation files |
| `getIsVisible()` | Whether the player is in the viewport |
| `addAnimation(params)` | Add an animation to a dotLottie file (triggers download) |
| `convert(params)` | Convert between JSON and dotLottie (triggers download) |

## Styles
Styles are included automatically when you import `@aarsteinmedia/dotlottie-react` or `@aarsteinmedia/dotlottie-react/light`. You usually do not need a separate CSS import.
If styles are missing, import them once in your app entry or root layout:

```ts
import '@aarsteinmedia/dotlottie-react/styles.css'
```

## License

This package is copyleft: [GPL-2.0-or-later](LICENSE.md)
