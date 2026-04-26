import { describe, it, expect } from 'vitest'
import { detectHarmony } from '@/lib/color/harmony/detect'
import type { OKLCH } from '@/lib/color/types'

const hue = (h: number): OKLCH => ({ l: 0.5, c: 0.15, h })

describe('detectHarmony', () => {
  it('detects triadic with hues [0, 120, 240]', () => {
    const result = detectHarmony([hue(0), hue(120), hue(240)])
    expect(result.template).toBe('triadic')
    expect(result.error).toBeLessThan(5)
    expect(result.confidence).toBe('high')
  })

  it('detects complementary with hues [30, 210]', () => {
    const result = detectHarmony([hue(30), hue(210)])
    expect(result.template).toBe('complementary')
    expect(result.error).toBeLessThan(5)
  })

  it('detects monochromatic with same hue', () => {
    const colors = [
      { l: 0.2, c: 0.15, h: 258 },
      { l: 0.5, c: 0.20, h: 260 },
      { l: 0.8, c: 0.05, h: 257 },
    ]
    const result = detectHarmony(colors)
    expect(result.template).toBe('mono')
    expect(result.confidence).not.toBe('none')
  })

  it('returns none confidence for scattered hues', () => {
    const result = detectHarmony([hue(0), hue(45), hue(90), hue(135)])
    expect(result.confidence).toBe('none')
  })

  it('excludes achromatic colors (c < 0.04) from detection', () => {
    const neutral: OKLCH = { l: 0.5, c: 0.01, h: 0 }
    const result = detectHarmony([hue(0), hue(180), neutral])
    expect(result.template).toBe('complementary')
  })
})
