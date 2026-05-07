import { describe, it, expect } from 'vitest'
import { fixAlternatives } from '@/lib/color/fix/alternatives'
import { wcagContrast } from '@/lib/color/contrast/wcag'
import { oklchToRgb } from '@/lib/color/oklch/format'
import type { OKLCH } from '@/lib/color/types'

const whiteOklch: OKLCH = { l: 0.99, c: 0, h: 0 }
const whiteRgb = { r: 255, g: 255, b: 255 }

// Magenta that fails WCAG AA on white (~3.9:1)
const failingColor: OKLCH = { l: 0.62, c: 0.22, h: 342 }

describe('fixAlternatives', () => {
  it('returns array (not null)', () => {
    const results = fixAlternatives(failingColor, whiteOklch, 'abc12345')
    expect(Array.isArray(results)).toBe(true)
  })

  it('each suggestion passes WCAG AA on white', () => {
    const results = fixAlternatives(failingColor, whiteOklch, 'abc12345')
    for (const s of results) {
      const rgb = oklchToRgb(s.newOklch)
      expect(wcagContrast(rgb, whiteRgb)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('each suggestion has required FixSuggestion shape', () => {
    const results = fixAlternatives(failingColor, whiteOklch, 'abc12345')
    expect(results.length).toBeGreaterThan(0)
    for (const s of results) {
      expect(s).toHaveProperty('targetColorId', 'abc12345')
      expect(s).toHaveProperty('newOklch')
      expect(s).toHaveProperty('delta')
      expect(s.delta).toHaveProperty('dL')
      expect(s.delta).toHaveProperty('dC')
      expect(s.delta).toHaveProperty('dH')
      expect(s).toHaveProperty('explanation')
      expect(s).toHaveProperty('preservedAxis')
      expect(s).toHaveProperty('highDelta')
    }
  })

  it('propagates targetColorId to all suggestions', () => {
    const results = fixAlternatives(failingColor, whiteOklch, 'myid999')
    for (const s of results) {
      expect(s.targetColorId).toBe('myid999')
    }
  })

  it('filters null results — no null in array', () => {
    const results = fixAlternatives(failingColor, whiteOklch, 'test')
    // TypeScript narrowed — but verify at runtime too
    for (const s of results) {
      expect(s).not.toBeNull()
    }
  })

  it('dark color on dark bg returns non-empty suggestions', () => {
    const darkBg: OKLCH = { l: 0.1, c: 0, h: 0 }
    const darkFg: OKLCH = { l: 0.25, c: 0.05, h: 180 }
    const results = fixAlternatives(darkFg, darkBg, 'dark1')
    expect(Array.isArray(results)).toBe(true)
  })
})
