import { RendererType } from '@aarsteinmedia/lottie-web/utils'
import { renderToString } from 'react-dom/server'
import {
  describe, expect, test, vi
} from 'vitest'

vi.mock('@aarsteinmedia/lottie-web/light', () => ({ loadAnimation: vi.fn() }))

describe('Light SSR', () => {
  test('falls back to svg renderer and warns once', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined),
      { default: DotLottiePlayer } = await import('@/light'),
      html = renderToString(<DotLottiePlayer renderer={RendererType.Canvas} src="/am.lottie" />)

    renderToString(<DotLottiePlayer renderer={RendererType.Canvas} src="/am.lottie" />)

    expect(html).toContain('data-renderer="svg"')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toContain('falling back to "svg"')

    warn.mockRestore()
  })
})
