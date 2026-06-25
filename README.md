# dotLottie React

![Awesome Vector Animations](/.github/readmeBanner.svg)

A React player for Lottie JSON and [dotLottie](https://dotlottie.io/) files. This package is a rework of [@aarsteinmedia/dotlottie-player](https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player), rebuilt for React with a modern hook-based architecture.

Requires **React 19**.

## Installation

```shell
pnpm add @aarsteinmedia/dotlottie-react
# or: npm install @aarsteinmedia/dotlottie-react
```

Import the bundled styles once in your app (required when using built-in controls):

```ts
import '@aarsteinmedia/dotlottie-react/styles.css'
```

## Quick start

```tsx
import DotLottiePlayer from '@aarsteinmedia/dotlottie-react'
import '@aarsteinmedia/dotlottie-react/styles.css'

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
| `@aarsteinmedia/dotlottie-react` | Default build with full renderer support (SVG, Canvas) and support for expressions |
| `@aarsteinmedia/dotlottie-react/light` | Smaller bundle; SVG renderer only |
| `@aarsteinmedia/dotlottie-react/enums` | `PlayerState`, `ObjectFit`, `PlayMode`, `RendererType`, `PlayerEvents` |
| `@aarsteinmedia/dotlottie-react/styles.css` | Player and control styles |

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

Exported types: `DotLottieProps`, `DotLottieMethods`.

## Props

Standard HTML attributes (for example `className`, `style`, `id`) are forwarded to the root element.

| Prop | Description | Type | Default |
| ---- | ----------- | ---- | ------- |
| `src` | URL to a `.json` or `.lottie` file | `string` | — |
| `autoplay` | Start playing when loaded | `boolean` | `false` |
| `loop` | Loop the animation | `boolean` | `false` |
| `loopLimit` | Stop after N loops (`0` = unlimited) | `number` | `0` |
| `controls` | Show the built-in control bar | `boolean` | `false` |
| `simple` | Minimal control bar (play, stop, seek only) | `boolean` | `false` |
| `direction` | Playback direction | `1` \| `-1` | `1` |
| `speed` | Playback speed multiplier | `number` | `1` |
| `mode` | Normal or bounce (boomerang) playback | `normal` \| `bounce` | `normal` |
| `renderer` | Rendering backend | `svg` \| `canvas` \| `html` | `svg` |
| `objectFit` | How the animation fits its container | `contain` \| `cover` \| `fill` \| `none` \| `scale-down` | `contain` |
| `background` | Background color of the animation area | `string` | — |
| `description` | Accessible label for the player | `string` | — |
| `hover` | Play on mouse enter, stop on mouse leave | `boolean` | `false` |
| `intermission` | Delay in ms between bounce loops | `number` | — |
| `animateOnScroll` | Scrub the animation based on page scroll | `boolean` | `false` |
| `subframe` | Sub-frame rendering (can reduce flicker on Safari/iOS) | `boolean` | `false` |
| `onLoad` | Called when the animation DOM is ready | `() => void` | — |
| `onComplete` | Called when playback completes | `() => void` | — |
| `onError` | Called on load or playback errors | `(message?: string) => void` | — |
| `ref` | Imperative API (see below) | `RefObject<DotLottieMethods>` | — |

## Imperative methods

Access via `ref`:

| Method | Description |
| ------ | ----------- |
| `play()` | Start or resume playback |
| `pause()` | Pause playback |
| `stop()` | Stop and reset loop counter |
| `seek(value)` | Jump to frame number or percentage (e.g. `"50%"`) |
| `load(src)` | Load a new animation URL |
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

## Events

The player dispatches custom events on the animation container (`<figure>`). Listen with `addEventListener` on a ref to the container, or use the `PlayerEvents` enum from `@aarsteinmedia/dotlottie-react/enums`:

| Event | When |
| ----- | ---- |
| `load` | Animation data is ready |
| `ready` | DOM is ready |
| `play` | Playback starts |
| `pause` | User-initiated pause |
| `freeze` | Programmatic pause (e.g. viewport or scrub) |
| `stop` | Playback stops |
| `loop` | A loop completes |
| `complete` | Animation finishes (detail: `{ frame, seeker }`) |
| `frame` | Each frame during playback (detail: `{ frame, seeker }`) |
| `next` / `previous` | Multi-animation navigation |
| `error` | Load or runtime error |

```tsx
import { PlayerEvents } from '@aarsteinmedia/dotlottie-react/enums'

containerRef.current?.addEventListener(PlayerEvents.Complete, (e) => {
  console.log((e as CustomEvent).detail)
})
```

## License

[GPL-2.0-or-later](LICENSE.md)
