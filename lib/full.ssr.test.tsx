import { renderToString } from 'react-dom/server'
import {
  describe, expect, test, vi
} from 'vitest'

vi.mock('@aarsteinmedia/lottie-web', () => ({ loadAnimation: vi.fn() }))

describe('SSR', () => {
  test('DotLottiePlayer renders to string', async () => {
    const { default: DotLottiePlayer } = await import('@/full'),
      html = renderToString(<DotLottiePlayer src="/am.lottie" />)

    expect(html).toContain('<figure')
  })
})