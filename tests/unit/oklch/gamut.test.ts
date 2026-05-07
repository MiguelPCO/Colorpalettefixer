import { describe, it, expect } from 'vitest'
import { mapToSrgb, chromaReductionRatio } from '@/lib/color/oklch/gamut'
import { isInSrgb } from '@/lib/color/oklch/format'
import type { OKLCH } from '@/lib/color/types'

describe('mapToSrgb', () => {
  it('in-gamut color is unchanged (c stays the same)', () => {
    const color: OKLCH = { l: 0.5, c: 0, h: 0 }
    const mapped = mapToSrgb(color)
    expect(mapped.l).toBeCloseTo(color.l, 4)
    expect(mapped.c).toBeCloseTo(color.c, 4)
  })

  it('in-gamut chromatic color maps to itself', () => {
    const color: OKLCH = { l: 0.6, c: 0.1, h: 180 }
    const mapped = mapToSrgb(color)
    expect(isInSrgb(mapped)).toBe(true)
  })

  it('out-of-gamut color (very high chroma) reduces chroma', () => {
    const outOfGamut: OKLCH = { l: 0.5, c: 0.5, h: 120 }
    const mapped = mapToSrgb(outOfGamut)
    expect(mapped.c).toBeLessThan(outOfGamut.c)
    expect(isInSrgb(mapped)).toBe(true)
  })

  it('preserves lightness and hue when clamping chroma', () => {
    const outOfGamut: OKLCH = { l: 0.7, c: 0.45, h: 60 }
    const mapped = mapToSrgb(outOfGamut)
    expect(mapped.l).toBeCloseTo(outOfGamut.l, 3)
    expect(mapped.h).toBeCloseTo(outOfGamut.h, 1)
  })

  it('chroma never goes below 0', () => {
    const extreme: OKLCH = { l: 0.5, c: 0.99, h: 0 }
    const mapped = mapToSrgb(extreme)
    expect(mapped.c).toBeGreaterThanOrEqual(0)
  })

  it('returns OKLCH shape', () => {
    const color: OKLCH = { l: 0.5, c: 0.2, h: 200 }
    const mapped = mapToSrgb(color)
    expect(mapped).toHaveProperty('l')
    expect(mapped).toHaveProperty('c')
    expect(mapped).toHaveProperty('h')
  })
})

describe('chromaReductionRatio', () => {
  it('original.c === 0 → ratio is 0', () => {
    const orig: OKLCH = { l: 0.5, c: 0, h: 0 }
    const mapped: OKLCH = { l: 0.5, c: 0, h: 0 }
    expect(chromaReductionRatio(orig, mapped)).toBe(0)
  })

  it('no reduction → ratio is 0', () => {
    const color: OKLCH = { l: 0.5, c: 0.2, h: 120 }
    expect(chromaReductionRatio(color, color)).toBeCloseTo(0, 5)
  })

  it('50% reduction → ratio ≈ 0.5', () => {
    const orig: OKLCH = { l: 0.5, c: 0.4, h: 0 }
    const mapped: OKLCH = { l: 0.5, c: 0.2, h: 0 }
    expect(chromaReductionRatio(orig, mapped)).toBeCloseTo(0.5, 5)
  })

  it('full reduction to 0 → ratio is 1', () => {
    const orig: OKLCH = { l: 0.5, c: 0.3, h: 0 }
    const mapped: OKLCH = { l: 0.5, c: 0, h: 0 }
    expect(chromaReductionRatio(orig, mapped)).toBeCloseTo(1, 5)
  })
})
