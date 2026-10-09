import type {
  AnimationConfiguration, AnimationData, AnimationItem
} from '@aarsteinmedia/lottie-web'

import { getAnimationData } from '@aarsteinmedia/lottie-web/dotlottie'
import { PlayerEvent } from '@aarsteinmedia/lottie-web/utils'
import {
  act, cleanup, render, waitFor
} from '@testing-library/react'
import { createRef } from 'react'
import {
  afterEach, beforeEach, describe, expect, test, vi
} from 'vitest'

import type { DotLottieMethods, DotLottieProps } from '@/types'

import { createDotLottiePlayer } from '@/utils/createDotLottiePlayer'

vi.mock('@aarsteinmedia/lottie-web/dotlottie', () => ({
  addAnimation: vi.fn(),
  convert: vi.fn(),
  getAnimationData: vi.fn(),
}))

type FakeItem = AnimationItem & {
  animationData: AnimationData
  emit: (type: string) => void
}

const createAnimation = (name: string) => ({
    fr: 30,
    h: 100,
    ip: 0,
    layers: [],
    nm: name,
    op: 60,
    v: '5.0.0',
    w: 100,
  }) as unknown as AnimationData,

  createFakeItem = (config: AnimationConfiguration): FakeItem => {
    const listeners = new Map<string, Set<EventListener>>()

    return {
      addEventListener: vi.fn((type: string, handler: EventListener) => {
        if (!listeners.has(type)) {
          listeners.set(type, new Set())
        }
        listeners.get(type)?.add(handler)
      }),
      animationData: config.animationData,
      currentFrame: 0,
      destroy: vi.fn(),
      emit: (type: string) => {
        for (const handler of listeners.get(type) ?? []) {
          handler(new Event(type))
        }
      },
      goToAndPlay: vi.fn(),
      goToAndStop: vi.fn(),
      pause: vi.fn(),
      play: vi.fn(),
      playDirection: 1,
      removeEventListener: vi.fn((type: string, handler: EventListener) => {
        listeners.get(type)?.delete(handler)
      }),
      setDirection: vi.fn(),
      setLoop: vi.fn(),
      setSpeed: vi.fn(),
      setSubframe: vi.fn(),
      stop: vi.fn(),
      totalFrames: 60,
    } as unknown as FakeItem
  }

let items: FakeItem[] = []

const loadAnimation = vi.fn((config: AnimationConfiguration) => {
    const item = createFakeItem(config)

    items.push(item)

    return item
  }),

  lastItem = () => {
    const item = items.at(-1)

    if (!item) {
      throw new Error('No animation instance created')
    }

    return item
  }

type TestPlayerProps = React.HTMLAttributes<HTMLElement> & DotLottieProps

function TestPlayer(props: TestPlayerProps) {
  return createDotLottiePlayer(loadAnimation, props)
}

async function renderLoaded(props: Partial<TestPlayerProps> = {}) {
  const ref = createRef<DotLottieMethods>(),
    view = render(<TestPlayer ref={ref} src="/test.lottie" {...props} />)

  await waitFor(() => {
    expect(loadAnimation).toHaveBeenCalledTimes(1)
  })

  return {
    ...view,
    ref
  }
}

beforeEach(() => {
  items = []
  loadAnimation.mockClear()
  vi.mocked(getAnimationData).mockReset()
  vi.mocked(getAnimationData).mockResolvedValue({
    animations: [createAnimation('first'), createAnimation('second')],
    isDotLottie: true,
    manifest: { animations: [{ id: 'first' }, { id: 'second' }] },
  })
})

afterEach(() => {
  cleanup()
})

describe('Player', () => {
  describe('next / previous', () => {
    test('next() mounts the following animation', async () => {
      const { ref } = await renderLoaded()

      act(() => {
        ref.current?.next()
      })

      expect(loadAnimation).toHaveBeenCalledTimes(2)
      expect(lastItem().animationData).toMatchObject({ nm: 'second' })
    })

    test('next() on the last animation and previous() on the first are no-ops', async () => {
      const { ref } = await renderLoaded()

      act(() => {
        ref.current?.previous()
      })
      expect(loadAnimation).toHaveBeenCalledTimes(1)

      act(() => {
        ref.current?.next()
      })
      act(() => {
        ref.current?.next()
      })
      expect(loadAnimation).toHaveBeenCalledTimes(2)
    })

    test('switching animation applies speed and direction to the new instance', async () => {
      const { ref } = await renderLoaded({
        direction: -1,
        speed: 2
      })

      act(() => {
        ref.current?.next()
      })

      expect(lastItem().setSpeed).toHaveBeenCalledWith(2)
      expect(lastItem().setDirection).toHaveBeenCalledWith(-1)
    })
  })

  describe('prop changes', () => {
    test('changing speed updates the instance without reloading', async () => {
      const { rerender } = await renderLoaded({ speed: 1 })

      rerender(<TestPlayer src="/test.lottie" speed={3} />)

      expect(getAnimationData).toHaveBeenCalledTimes(1)
      expect(loadAnimation).toHaveBeenCalledTimes(1)
      expect(lastItem().setSpeed).toHaveBeenLastCalledWith(3)
    })

    test('changing speed works without per-animation settings', async () => {
      vi.mocked(getAnimationData).mockResolvedValue({
        animations: [createAnimation('json')],
        isDotLottie: false,
        manifest: null,
      })

      const { rerender } = await renderLoaded()

      expect(() => {
        rerender(<TestPlayer src="/test.json" direction={-1} speed={2} />)
      }).not.toThrow()
      expect(lastItem().setSpeed).toHaveBeenLastCalledWith(2)
      expect(lastItem().setDirection).toHaveBeenLastCalledWith(-1)
    })

    test('a new inline onError on every render does not reload', async () => {
      const { rerender } = await renderLoaded({ onError: () => undefined })

      rerender(<TestPlayer src="/test.lottie" onError={() => undefined} />)
      rerender(<TestPlayer src="/test.lottie" onError={() => undefined} />)

      expect(getAnimationData).toHaveBeenCalledTimes(1)
      expect(loadAnimation).toHaveBeenCalledTimes(1)
    })
  })

  describe('animation events', () => {
    test('events from the instance reach the callbacks', async () => {
      const onComplete = vi.fn(),
        onLoad = vi.fn()

      await renderLoaded({
        onComplete,
        onLoad
      })

      act(() => {
        lastItem().emit(PlayerEvent.DOMLoaded)
        lastItem().emit(PlayerEvent.Complete)
      })

      expect(onLoad).toHaveBeenCalledTimes(1)
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    test('events from a new instance use the latest callback', async () => {
      const { ref, rerender } = await renderLoaded(),
        onComplete = vi.fn()

      act(() => {
        ref.current?.next()
      })
      rerender(<TestPlayer ref={ref} src="/test.lottie" onComplete={onComplete} />)

      act(() => {
        lastItem().emit(PlayerEvent.Complete)
      })

      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    test('nothing polls for an instance after a failed load', async () => {
      vi.mocked(getAnimationData).mockRejectedValue(new Error('Not found'))

      const onError = vi.fn(),
        raf = vi.spyOn(window, 'requestAnimationFrame')

      render(<TestPlayer src="/missing.lottie" onError={onError} />)

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Not found')
      })

      raf.mockClear()
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(raf).not.toHaveBeenCalled()
      raf.mockRestore()
    })
  })

  describe('window focus', () => {
    test('blur freezes playback and it stays frozen until focus', async () => {
      await renderLoaded({ autoplay: true })

      const item = lastItem()

      await waitFor(() => {
        expect(item.play).toHaveBeenCalledTimes(1)
      })

      act(() => {
        window.dispatchEvent(new FocusEvent('blur'))
      })

      expect(item.pause).toHaveBeenCalledTimes(1)
      expect(item.play).toHaveBeenCalledTimes(1)

      act(() => {
        window.dispatchEvent(new FocusEvent('focus'))
      })

      expect(item.play).toHaveBeenCalledTimes(2)
    })
  })
})
