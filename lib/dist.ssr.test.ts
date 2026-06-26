import { readFile } from 'node:fs/promises'
import {
  describe, expect, test
} from 'vitest'

describe('dist entried', () => {
  test.each(['full.js', 'light.js'])('%s preserves use client', async entry => {
    const source = await readFile(`dist/${entry}`, 'utf-8')

    expect(source).toMatch(/^['"]use client['"]/)
  })
})