import { describe, it, expect } from 'vitest'
import { generateRamp } from '@/lib/color/ramp/generate'
import { wcagContrast } from '@/lib/color/contrast/wcag'
import { oklchToRgb, isInSrgb } from '@/lib/color/oklch/format'

describe('generateRamp', () => {
  const brandMagenta = { l: 0.55, c: 0.22, h: 342 }

  it('generates exactly 12 steps', () => {
    const ramp = generateRamp(brandMagenta, 'light')
    expect(ramp).toHaveLength(12)
  })

  it('lightness is monotonically decreasing step 1→12 in light mode', () => {
    const ramp = generateRamp(brandMagenta, 'light')
    for (let i = 1; i < ramp.length; i++) {
      expect(ramp[i]!.l).toBeLessThanOrEqual(ramp[i-1]!.l)
    }
  })

  it('step 9 is close to brand lightness', () => {
    const ramp = generateRamp(brandMagenta, 'light')
    expect(Math.abs(ramp[8]!.l - brandMagenta.l)).toBeLessThan(0.05)
  })

  it('all steps are in sRGB gamut', () => {
    const ramp = generateRamp(brandMagenta, 'light')
    for (const step of ramp) {
      expect(isInSrgb(step)).toBe(true)
    }
  })

  it('step 9 light mode passes WCAG AA on white (4.5:1)', () => {
    const ramp = generateRamp(brandMagenta, 'light')
    const white = { r: 255, g: 255, b: 255 }
    const step9Rgb = oklchToRgb(ramp[8]!)
    expect(wcagContrast(step9Rgb, white)).toBeGreaterThanOrEqual(4.5)
  })
})
