import { describe, it, expect } from 'vitest'
import { wcagContrast, relativeLuminance, wcagPassLevel } from '@/lib/color/contrast/wcag'
import { WCAG_GOLDEN } from '@/tests/golden/wcag-pairs'
import { oklchToRgb } from '@/lib/color/oklch/format'
import { parseToOklch } from '@/lib/color/oklch/parse'

function hexToRgb(hex: string) {
  const oklch = parseToOklch(hex)!
  return oklchToRgb(oklch)
}

describe('wcagContrast', () => {
  it('golden set matches WebAIM values within ±0.1', () => {
    for (const pair of WCAG_GOLDEN) {
      const ratio = wcagContrast(hexToRgb(pair.fg), hexToRgb(pair.bg))
      expect(ratio).toBeCloseTo(pair.ratio, 0)
    }
  })

  it('is symmetric: contrast(a,b) === contrast(b,a)', () => {
    const white = hexToRgb('#ffffff')
    const black = hexToRgb('#000000')
    expect(wcagContrast(white, black)).toBeCloseTo(wcagContrast(black, white), 5)
  })

  it('white on white = 1:1', () => {
    const white = hexToRgb('#ffffff')
    expect(wcagContrast(white, white)).toBeCloseTo(1, 2)
  })

  it('black on white = 21:1', () => {
    const white = hexToRgb('#ffffff')
    const black = hexToRgb('#000000')
    expect(wcagContrast(black, white)).toBeCloseTo(21, 0)
  })
})

describe('relativeLuminance', () => {
  it('white has luminance 1', () => {
    const white = hexToRgb('#ffffff')
    expect(relativeLuminance(white)).toBeCloseTo(1, 5)
  })

  it('black has luminance 0', () => {
    const black = hexToRgb('#000000')
    expect(relativeLuminance(black)).toBeCloseTo(0, 5)
  })

  it('mid-gray has intermediate luminance', () => {
    const gray = hexToRgb('#808080')
    const lum = relativeLuminance(gray)
    expect(lum).toBeGreaterThan(0)
    expect(lum).toBeLessThan(1)
  })

  it('red has expected luminance', () => {
    const red = hexToRgb('#ff0000')
    expect(relativeLuminance(red)).toBeCloseTo(0.2126, 4)
  })

  it('green has expected luminance', () => {
    const green = hexToRgb('#00ff00')
    expect(relativeLuminance(green)).toBeCloseTo(0.7152, 4)
  })

  it('blue has expected luminance', () => {
    const blue = hexToRgb('#0000ff')
    expect(relativeLuminance(blue)).toBeCloseTo(0.0722, 4)
  })
})

describe('wcagPassLevel', () => {
  it('ratio >= 7, not large text → AAA', () => {
    expect(wcagPassLevel(7.5, false)).toBe('AAA')
  })

  it('ratio >= 4.5, not large text → AA', () => {
    expect(wcagPassLevel(5.0, false)).toBe('AA')
  })

  it('ratio >= 4.5, large text → AAA', () => {
    expect(wcagPassLevel(5.0, true)).toBe('AAA')
  })

  it('ratio >= 3, large text → AA', () => {
    expect(wcagPassLevel(3.5, true)).toBe('AA')
  })

  it('ratio >= 3, not large text → AA-large', () => {
    expect(wcagPassLevel(3.5, false)).toBe('AA-large')
  })

  it('ratio < 3 → fail', () => {
    expect(wcagPassLevel(2.0, false)).toBe('fail')
    expect(wcagPassLevel(2.0, true)).toBe('fail')
  })
})
