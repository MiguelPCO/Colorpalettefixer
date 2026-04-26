import { describe, it, expect } from 'vitest'
import { parseToOklch } from '@/lib/color/oklch/parse'

describe('parseToOklch', () => {
  it('parses 6-digit hex', () => {
    const result = parseToOklch('#FF0066')
    expect(result).not.toBeNull()
    expect(result!.c).toBeGreaterThan(0.1)
  })

  it('parses 3-digit hex', () => {
    const result = parseToOklch('#F06')
    expect(result).not.toBeNull()
  })

  it('parses rgb()', () => {
    const result = parseToOklch('rgb(255, 0, 102)')
    expect(result).not.toBeNull()
  })

  it('parses oklch()', () => {
    const result = parseToOklch('oklch(0.62 0.25 342)')
    expect(result).not.toBeNull()
    expect(result!.l).toBeCloseTo(0.62, 2)
    expect(result!.c).toBeCloseTo(0.25, 2)
    expect(result!.h).toBeCloseTo(342, 1)
  })

  it('parses named CSS color', () => {
    const result = parseToOklch('hotpink')
    expect(result).not.toBeNull()
  })

  it('returns null for invalid input', () => {
    expect(parseToOklch('not-a-color')).toBeNull()
    expect(parseToOklch('')).toBeNull()
  })

  it('clamps L to [0,1]', () => {
    const result = parseToOklch('#000000')
    expect(result!.l).toBeGreaterThanOrEqual(0)
    expect(result!.l).toBeLessThanOrEqual(1)
  })

  it('hue is in [0, 360)', () => {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00']
    for (const c of colors) {
      const r = parseToOklch(c)
      expect(r!.h).toBeGreaterThanOrEqual(0)
      expect(r!.h).toBeLessThan(360)
    }
  })
})
