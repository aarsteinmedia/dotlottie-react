import {
  describe, expect, test
} from 'vitest'

describe('constants (server)', () => {
  test('constants are safe to import on server', async () => {
    const { hasIOSupport, hasReducedMotion } = await import('@/utils/constants')

    expect(hasIOSupport).toBeFalsy()
    expect(hasReducedMotion).toBeFalsy()
  })
})