import { describe, it, expect } from 'vitest'
import { oklchToHex, oklchToRgb, isInSrgb, oklchToCss } from '@/lib/color/oklch/format'
import type { OKLCH } from '@/lib/color/types'

const black: OKLCH = { l: 0, c: 0, h: 0 }
const white: OKLCH = { l: 1, c: 0, h: 0 }
const mid: OKLCH = { l: 0.5, c: 0, h: 0 }

describe('oklchToHex', () => {
  it('black → #000000', () => {
    expect(oklchToHex(black)).toBe('#000000')
  })

  it('white → #ffffff', () => {
    expect(oklchToHex(white)).toBe('#ffffff')
  })

  it('returns 7-char lowercase hex string', () => {
    const hex = oklchToHex({ l: 0.6, c: 0.15, h: 258 })
    expect(hex).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('falls back to #000000 for edge input (l=0, c=0)', () => {
    const hex = oklchToHex(black)
    expect(hex).toBe('#000000')
  })
})

describe('oklchToRgb', () => {
  it('black → {r:0, g:0, b:0}', () => {
    expect(oklchToRgb(black)).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('white → {r:255, g:255, b:255}', () => {
    expect(oklchToRgb(white)).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('values are integers in [0, 255]', () => {
    const rgb = oklchToRgb({ l: 0.6, c: 0.18, h: 30 })
    expect(rgb.r).toBeGreaterThanOrEqual(0)
    expect(rgb.r).toBeLessThanOrEqual(255)
    expect(Number.isInteger(rgb.r)).toBe(true)
    expect(rgb.g).toBeGreaterThanOrEqual(0)
    expect(rgb.g).toBeLessThanOrEqual(255)
    expect(Number.isInteger(rgb.g)).toBe(true)
    expect(rgb.b).toBeGreaterThanOrEqual(0)
    expect(rgb.b).toBeLessThanOrEqual(255)
    expect(Number.isInteger(rgb.b)).toBe(true)
  })

  it('falls back {r:0,g:0,b:0} gracefully', () => {
    const rgb = oklchToRgb(black)
    expect(rgb).toEqual({ r: 0, g: 0, b: 0 })
  })
})

describe('isInSrgb', () => {
  it('achromatic black is in sRGB', () => {
    expect(isInSrgb(black)).toBe(true)
  })

  it('achromatic white is in sRGB', () => {
    expect(isInSrgb(white)).toBe(true)
  })

  it('mid-gray is in sRGB', () => {
    expect(isInSrgb(mid)).toBe(true)
  })

  it('very high chroma is out of sRGB', () => {
    expect(isInSrgb({ l: 0.5, c: 0.5, h: 120 })).toBe(false)
  })

  it('low chroma is in sRGB', () => {
    expect(isInSrgb({ l: 0.5, c: 0.05, h: 200 })).toBe(true)
  })
})

describe('oklchToCss', () => {
  it('formats without alpha when alpha=1 (default)', () => {
    const css = oklchToCss({ l: 0.5, c: 0.1, h: 120 })
    expect(css).toBe('oklch(0.5000 0.1000 120.00)')
  })

  it('includes alpha string when alpha < 1', () => {
    const css = oklchToCss({ l: 0.5, c: 0.1, h: 120 }, 0.5)
    expect(css).toContain('/ 0.5')
  })

  it('no alpha suffix when alpha=1 explicitly', () => {
    const css = oklchToCss({ l: 0.5, c: 0.1, h: 120 }, 1)
    expect(css).not.toContain('/')
  })

  it('l and c use 4 decimal places', () => {
    const css = oklchToCss({ l: 0.123456, c: 0.098765, h: 45 })
    expect(css).toContain('0.1235')
    expect(css).toContain('0.0988')
  })

  it('h uses 2 decimal places', () => {
    const css = oklchToCss({ l: 0.5, c: 0.1, h: 45.678 })
    expect(css).toContain('45.68')
  })
})
