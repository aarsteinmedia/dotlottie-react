import {
  describe, expect, test
} from 'vitest'

describe('constants (server)', () => {
  test('constants are safe to import on server', async () => {
    const { HAS_IO_SUPPORT, reducedMotionQuery } = await import('@/utils/constants')

    expect(HAS_IO_SUPPORT).toBeFalsy()
    expect(reducedMotionQuery?.matches).toBeFalsy()
  })
})