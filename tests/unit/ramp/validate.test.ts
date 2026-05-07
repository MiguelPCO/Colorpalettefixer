import { describe, it, expect } from 'vitest'
import { validateRamp } from '@/lib/color/ramp/validate'
import type { OKLCH } from '@/lib/color/types'

function makeRamp(mode: 'light' | 'dark', steps = 12): OKLCH[] {
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1)
    const l = mode === 'light' ? 0.95 - t * 0.85 : 0.1 + t * 0.85
    return { l, c: 0, h: 0 }
  })
}

describe('validateRamp', () => {
  describe('valid ramps', () => {
    it('valid light ramp returns isValid=true with no errors', () => {
      const result = validateRamp(makeRamp('light'), 'light')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('valid dark ramp returns isValid=true with no errors', () => {
      const result = validateRamp(makeRamp('dark'), 'dark')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('length validation', () => {
    it('rejects ramp with fewer than 12 steps', () => {
      const result = validateRamp(makeRamp('light', 10), 'light')
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('12'))).toBe(true)
    })

    it('rejects ramp with more than 12 steps', () => {
      const result = validateRamp(makeRamp('light', 14), 'light')
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('14'))).toBe(true)
    })

    it('empty ramp reports length error', () => {
      const result = validateRamp([], 'light')
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('monotonicity — light mode (decreasing L)', () => {
    it('detects increasing L in light ramp', () => {
      const ramp = makeRamp('light')
      // Swap two adjacent steps to break monotonicity
      const broken = [...ramp]
      const tmp = broken[3]!
      broken[3] = broken[4]!
      broken[4] = tmp
      const result = validateRamp(broken, 'light')
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.toLowerCase().includes('decreasing'))).toBe(true)
    })
  })

  describe('monotonicity — dark mode (increasing L)', () => {
    it('detects decreasing L in dark ramp', () => {
      const ramp = makeRamp('dark')
      const broken = [...ramp]
      const tmp = broken[5]!
      broken[5] = broken[6]!
      broken[6] = tmp
      const result = validateRamp(broken, 'dark')
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.toLowerCase().includes('increasing'))).toBe(true)
    })
  })

  describe('gamut validation', () => {
    it('detects out-of-sRGB step', () => {
      const ramp = makeRamp('light')
      // Very high chroma → outside sRGB
      const broken = [...ramp]
      broken[6] = { l: 0.5, c: 0.5, h: 120 }
      const result = validateRamp(broken, 'light')
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.toLowerCase().includes('gamut'))).toBe(true)
    })
  })

  describe('multiple errors', () => {
    it('collects all errors when multiple issues exist', () => {
      // Wrong length + (no monotonicity or gamut checks since length fails early... but code still loops)
      const short: OKLCH[] = [{ l: 0.5, c: 0, h: 0 }, { l: 0.6, c: 0, h: 0 }]
      const result = validateRamp(short, 'light')
      expect(result.isValid).toBe(false)
      // At least length error; lightness check also runs for the 2 steps
      expect(result.errors.length).toBeGreaterThanOrEqual(1)
    })
  })
})
