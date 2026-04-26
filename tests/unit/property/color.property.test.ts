import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import { parseToOklch } from '@/lib/color/oklch/parse'
import { oklchToHex, isInSrgb } from '@/lib/color/oklch/format'
import { mapToSrgb } from '@/lib/color/oklch/gamut'
import { wcagContrast } from '@/lib/color/contrast/wcag'
import { oklchToRgb } from '@/lib/color/oklch/format'
import { fixMinDelta } from '@/lib/color/fix/minDelta'

const arbRgb = fc.record({
  r: fc.integer({ min: 0, max: 255 }),
  g: fc.integer({ min: 0, max: 255 }),
  b: fc.integer({ min: 0, max: 255 }),
})

const arbOklch = fc.record({
  l: fc.double({ min: 0, max: 1, noNaN: true }),
  c: fc.double({ min: 0, max: 0.4, noNaN: true }),
  h: fc.double({ min: 0, max: 360, noNaN: true }),
})

describe('property: parse roundtrip', () => {
  it('parse(hex(color)) round-trips RGB within ±1', () => {
    fc.assert(fc.property(arbRgb, (rgb) => {
      const hex = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`
      const parsed = parseToOklch(hex)
      if (!parsed) return false
      const back = oklchToRgb(parsed)
      return (
        Math.abs(back.r - rgb.r) <= 1 &&
        Math.abs(back.g - rgb.g) <= 1 &&
        Math.abs(back.b - rgb.b) <= 1
      )
    }))
  })
})

describe('property: wcagContrast symmetry', () => {
  it('contrast(a,b) === contrast(b,a)', () => {
    fc.assert(fc.property(arbRgb, arbRgb, (a, b) => {
      const diff = Math.abs(wcagContrast(a, b) - wcagContrast(b, a))
      return diff < 0.001
    }))
  })
})

describe('property: gamut mapping', () => {
  it('mapToSrgb always produces in-gamut color', () => {
    fc.assert(fc.property(arbOklch, (color) => {
      const mapped = mapToSrgb(color)
      return isInSrgb(mapped)
    }))
  })
})

describe('property: fix guarantees AA', () => {
  it('fixMinDelta result always passes WCAG AA on white', () => {
    const WHITE = { r: 255, g: 255, b: 255 }
    const WHITE_OKLCH = { l: 0.999, c: 0, h: 0 }
    fc.assert(fc.property(
      fc.record({ l: fc.double({ min: 0.3, max: 0.8, noNaN: true }), c: fc.double({ min: 0.05, max: 0.3, noNaN: true }), h: fc.double({ min: 0, max: 360, noNaN: true }) }),
      (color) => {
        const fix = fixMinDelta(color, { type: 'wcag-aa', background: WHITE_OKLCH })
        if (!fix) return true  // already passes or unfixable
        const rgb = oklchToRgb(fix.newOklch)
        return wcagContrast(rgb, WHITE) >= 4.5
      }
    ), { numRuns: 50 })
  })
})
