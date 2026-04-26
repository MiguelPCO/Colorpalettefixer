import { describe, it, expect } from 'vitest'
import { fixMinDelta } from '@/lib/color/fix/minDelta'
import { wcagContrast } from '@/lib/color/contrast/wcag'
import { oklchToRgb } from '@/lib/color/oklch/format'

describe('fixMinDelta', () => {
  const white = { r: 255, g: 255, b: 255 }
  const whiteOklch = { l: 0.99, c: 0, h: 0 }

  it('result passes WCAG AA on white', () => {
    // Magenta that fails: ratio ~3.9
    const color = { l: 0.62, c: 0.22, h: 342 }
    const result = fixMinDelta(color, { type: 'wcag-aa', background: whiteOklch })
    expect(result).not.toBeNull()
    const rgb = oklchToRgb(result!.newOklch)
    expect(wcagContrast(rgb, white)).toBeGreaterThanOrEqual(4.5)
  })

  it('preserves hue when possible (|dH| ≈ 0)', () => {
    const color = { l: 0.62, c: 0.22, h: 258 }
    const result = fixMinDelta(color, { type: 'wcag-aa', background: whiteOklch })
    if (result) {
      expect(Math.abs(result.delta.dH)).toBeLessThan(1)
    }
  })

  it('marks high-delta when |dL| > 0.15', () => {
     // Force a case that needs big lightness shift
     const color = { l: 0.85, c: 0.1, h: 180 }
     const result = fixMinDelta(color, { type: 'wcag-aa', background: whiteOklch })
     if (result && Math.abs(result.delta.dL) > 0.15) {
       expect(result.highDelta).toBe(true)
     }
  })

  it('returns null if already passing', () => {
    const black = { l: 0, c: 0, h: 0 }
    const result = fixMinDelta(black, { type: 'wcag-aa', background: whiteOklch })
    expect(result).toBeNull()
  })
})
