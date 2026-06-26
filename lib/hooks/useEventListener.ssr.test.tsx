import { renderToString } from 'react-dom/server'
import {
  afterEach, describe, expect, test, vi
} from 'vitest'

describe('useEventListener (server)', () => {
  afterEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
  })

  test('mounts without throwing on server', async () => {
    const { useEventListener, WINDOW_LISTENER_OPTS } = await import('@/hooks/useEventListener')

    function Harness() {
      useEventListener(
        'focus', vi.fn(), WINDOW_LISTENER_OPTS
      )

      return null
    }

    expect(() => renderToString(<Harness />)).not.toThrow()
  })
})