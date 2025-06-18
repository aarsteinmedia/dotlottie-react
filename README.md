# AM LottiePlayer React

![Awesome Vector Animations](/.github/readmeBanner.svg)

This is a work in progress, and a reworked verson of [@aarsteinmedia/dotlottie-player](https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player), made to work natively with React.

## Installation

```shell
pnpm add @aarsteinmedia/dotlottie-react
```

## Usage

```jsx
import DotLottiePlayer '@aarsteinmedia/dotlottie-react'

function App() {
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

export default App
```

## Properties

| Property / Attribute      | Description                                                                                                                   | Type                                     | Default           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------- |
| `animateOncroll`          | Play animation by scrolling                                                                                                   | `boolean`                                | `false`           |
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
| `src` _(required)_        | URL to LottieJSON or dotLottie                                                                                                | `string`                                 | `undefined`       |
| `subframe`                | When enabled this can help to reduce flicker on some animations, especially on Safari and iOS devices.                        | `boolean`                                | `false`           |


## WordPress Plugins
<img align="left" width="110" height="110" src="/.github/wpIcon.svg" style="margin-right:1em" />

We've made a free WordPress plugin that works with Gutenberg Blocks, Elementor, Divi Builder and Flatsome UX Builder: [AM LottiePlayer](https://www.aarstein.media/en/am-lottieplayer). It has all the functionality of this package, with a helpful user interface.

It's super lightweight – and only loads on pages where animations are used.

We've also made a premium WordPress plugin for purchase: [AM LottiePlayer PRO](https://www.aarstein.media/en/am-lottieplayer/pro). It has an easy-to-use GUI for combining and controlling multiple Lottie animations in a single file, converting JSON to dotLottie with drag-and-drop, and many more exclusive features.

## License

GPL-2.0-or-later