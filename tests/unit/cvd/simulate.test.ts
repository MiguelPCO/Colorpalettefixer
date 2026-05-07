import { describe, it, expect } from 'vitest'
import { simulateCvd } from '@/lib/color/cvd/simulate'
import { deltaEok } from '@/lib/color/cvd/deltaE'
import type { RGB } from '@/lib/color/types'

const red: RGB = { r: 255, g: 0, b: 0 }
const green: RGB = { r: 0, g: 255, b: 0 }
const blue: RGB = { r: 0, g: 0, b: 255 }
const white: RGB = { r: 255, g: 255, b: 255 }
const black: RGB = { r: 0, g: 0, b: 0 }
const gray: RGB = { r: 128, g: 128, b: 128 }

describe('simulateCvd', () => {
  it('returns RGB shape with integer values', () => {
    const result = simulateCvd(red, 'deuteranopia')
    expect(result).toHaveProperty('r')
    expect(result).toHaveProperty('g')
    expect(result).toHaveProperty('b')
    expect(Number.isInteger(result.r)).toBe(true)
    expect(Number.isInteger(result.g)).toBe(true)
    expect(Number.isInteger(result.b)).toBe(true)
  })

  it('values are in [0, 255]', () => {
    for (const type of ['deuteranopia', 'protanopia', 'tritanopia', 'achromatopsia'] as const) {
      const result = simulateCvd(red, type)
      expect(result.r).toBeGreaterThanOrEqual(0)
      expect(result.r).toBeLessThanOrEqual(255)
      expect(result.g).toBeGreaterThanOrEqual(0)
      expect(result.g).toBeLessThanOrEqual(255)
      expect(result.b).toBeGreaterThanOrEqual(0)
      expect(result.b).toBeLessThanOrEqual(255)
    }
  })

  it('deuteranopia: red appears more similar to green than original', () => {
    const originalDelta = deltaEok(red, green)
    const simRed = simulateCvd(red, 'deuteranopia')
    const simGreen = simulateCvd(green, 'deuteranopia')
    const simDelta = deltaEok(simRed, simGreen)
    expect(simDelta).toBeLessThan(originalDelta)
  })

  it('protanopia: simulation changes red channel', () => {
    const result = simulateCvd(red, 'protanopia')
    // Pure red should shift under protanopia (r,g,b won't stay 255,0,0)
    const unchanged = result.r === 255 && result.g === 0 && result.b === 0
    expect(unchanged).toBe(false)
  })

  it('tritanopia: simulation changes blue channel', () => {
    const result = simulateCvd(blue, 'tritanopia')
    const unchanged = result.r === 0 && result.g === 0 && result.b === 255
    expect(unchanged).toBe(false)
  })

  it('achromatopsia: output is grayscale (r ≈ g ≈ b)', () => {
    const result = simulateCvd(red, 'achromatopsia')
    expect(Math.abs(result.r - result.g)).toBeLessThan(5)
    expect(Math.abs(result.g - result.b)).toBeLessThan(5)
  })

  it('white is unaffected by any CVD simulation', () => {
    for (const type of ['deuteranopia', 'protanopia', 'tritanopia', 'achromatopsia'] as const) {
      const result = simulateCvd(white, type)
      expect(result.r).toBeCloseTo(255, -1)
      expect(result.g).toBeCloseTo(255, -1)
      expect(result.b).toBeCloseTo(255, -1)
    }
  })

  it('black is unaffected by any CVD simulation', () => {
    for (const type of ['deuteranopia', 'protanopia', 'tritanopia', 'achromatopsia'] as const) {
      const result = simulateCvd(black, type)
      expect(result.r).toBeCloseTo(0, -1)
      expect(result.g).toBeCloseTo(0, -1)
      expect(result.b).toBeCloseTo(0, -1)
    }
  })
})

describe('deltaEok', () => {
  it('same color → 0', () => {
    expect(deltaEok(red, red)).toBeCloseTo(0, 5)
  })

  it('black and white → large distance', () => {
    expect(deltaEok(black, white)).toBeGreaterThan(0.9)
  })

  it('similar colors → small distance', () => {
    const almostRed: RGB = { r: 250, g: 5, b: 5 }
    expect(deltaEok(red, almostRed)).toBeLessThan(0.05)
  })

  it('result is non-negative', () => {
    expect(deltaEok(red, blue)).toBeGreaterThanOrEqual(0)
    expect(deltaEok(gray, white)).toBeGreaterThanOrEqual(0)
  })
})
