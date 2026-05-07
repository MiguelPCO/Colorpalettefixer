import { describe, it, expect } from 'vitest'
import {
  circularMeanHue,
  circularR,
  temperatureBalance,
  angularDistance,
} from '@/lib/color/harmony/balance'
import type { OKLCH } from '@/lib/color/types'

const c = (h: number, chroma = 0.15): OKLCH => ({ l: 0.5, c: chroma, h })

describe('circularMeanHue', () => {
  it('empty array returns 0', () => {
    expect(circularMeanHue([])).toBe(0)
  })

  it('single hue returns itself', () => {
    expect(circularMeanHue([120])).toBeCloseTo(120, 1)
  })

  it('identical hues return that hue', () => {
    expect(circularMeanHue([45, 45, 45])).toBeCloseTo(45, 1)
  })

  it('wrap-around: [350, 10] mean ≈ 0', () => {
    const mean = circularMeanHue([350, 10])
    // Both are near 0/360 so mean should be near 0 or 360
    expect(mean < 20 || mean > 340).toBe(true)
  })

  it('result is in [0, 360)', () => {
    const hues = [10, 90, 200, 300]
    const mean = circularMeanHue(hues)
    expect(mean).toBeGreaterThanOrEqual(0)
    expect(mean).toBeLessThan(360)
  })
})

describe('circularR', () => {
  it('empty array returns 0', () => {
    expect(circularR([])).toBe(0)
  })

  it('all same hue returns 1', () => {
    expect(circularR([90, 90, 90])).toBeCloseTo(1, 5)
  })

  it('perfectly spread 4 hues returns ≈ 0', () => {
    expect(circularR([0, 90, 180, 270])).toBeCloseTo(0, 5)
  })

  it('single hue returns 1', () => {
    expect(circularR([200])).toBeCloseTo(1, 5)
  })

  it('result is in [0, 1]', () => {
    const r = circularR([10, 80, 160, 250, 340])
    expect(r).toBeGreaterThanOrEqual(0)
    expect(r).toBeLessThanOrEqual(1)
  })
})

describe('temperatureBalance', () => {
  it('empty array returns 0', () => {
    expect(temperatureBalance([])).toBe(0)
  })

  it('all achromatic (c < 0.04) returns 0', () => {
    const colors: OKLCH[] = [
      { l: 0.5, c: 0.01, h: 30 },
      { l: 0.7, c: 0.02, h: 200 },
    ]
    expect(temperatureBalance(colors)).toBe(0)
  })

  it('warm-dominant palette returns positive value', () => {
    // Warm hues: ~0-60 (red, orange, yellow)
    const warm: OKLCH[] = [c(20), c(30), c(40)]
    expect(temperatureBalance(warm)).toBeGreaterThan(0)
  })

  it('cool-dominant palette returns negative value', () => {
    // Cool hues: ~180-270 (blue, cyan)
    const cool: OKLCH[] = [c(210), c(230), c(250)]
    expect(temperatureBalance(cool)).toBeLessThan(0)
  })

  it('result is in [-1, 1]', () => {
    const mixed: OKLCH[] = [c(0), c(120), c(240)]
    const t = temperatureBalance(mixed)
    expect(t).toBeGreaterThanOrEqual(-1)
    expect(t).toBeLessThanOrEqual(1)
  })
})

describe('angularDistance', () => {
  it('same angle → 0', () => {
    expect(angularDistance(90, 90)).toBe(0)
  })

  it('0 and 180 → 180', () => {
    expect(angularDistance(0, 180)).toBe(180)
  })

  it('0 and 360 → 0 (full wrap)', () => {
    expect(angularDistance(0, 360)).toBe(0)
  })

  it('shortest path: 10 and 350 → 20', () => {
    expect(angularDistance(10, 350)).toBeCloseTo(20, 5)
  })

  it('symmetric: a↔b same result', () => {
    expect(angularDistance(30, 200)).toBeCloseTo(angularDistance(200, 30), 5)
  })

  it('result is in [0, 180]', () => {
    const d = angularDistance(45, 315)
    expect(d).toBeGreaterThanOrEqual(0)
    expect(d).toBeLessThanOrEqual(180)
  })
})
