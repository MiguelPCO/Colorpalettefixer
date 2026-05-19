import { describe, it, expect } from 'vitest'
import { parseColorInput } from '@/lib/color/parseInput'

describe('parseColorInput', () => {
  it('parses #hex', () => {
    const r = parseColorInput('#3b82f6')
    expect(r?.hex).toBe('#3b82f6')
    expect(r?.oklch).toBeDefined()
  })

  it('parses hex without #', () => {
    const r = parseColorInput('3b82f6')
    expect(r?.hex).toBe('#3b82f6')
  })

  it('parses rgb() CSS syntax', () => {
    const r = parseColorInput('rgb(59, 130, 246)')
    expect(r?.hex).toBe('#3b82f6')
  })

  it('parses bare RGB "59, 130, 246"', () => {
    const r = parseColorInput('59, 130, 246')
    expect(r?.hex).toBe('#3b82f6')
  })

  it('parses bare RGB with spaces "59 130 246"', () => {
    const r = parseColorInput('59 130 246')
    expect(r?.hex).toBe('#3b82f6')
  })

  it('parses hsl() CSS syntax', () => {
    const r = parseColorInput('hsl(0, 0%, 100%)')
    expect(r?.hex).toBe('#ffffff')
  })

  it('parses bare HSL "0, 0%, 100%"', () => {
    const r = parseColorInput('0, 0%, 100%')
    expect(r?.hex).toBe('#ffffff')
  })

  it('parses oklch() CSS syntax', () => {
    const r = parseColorInput('oklch(1 0 0)')
    expect(r?.hex).toBe('#ffffff')
  })

  it('parses bare OKLCH "0.0 0.0 0"', () => {
    const r = parseColorInput('0.0 0.0 0')
    expect(r?.hex).toBe('#000000')
  })

  it('returns null for empty string', () => {
    expect(parseColorInput('')).toBeNull()
  })

  it('returns null for invalid input', () => {
    expect(parseColorInput('not a color')).toBeNull()
    expect(parseColorInput('gggggg')).toBeNull()
  })

  it('oklch L is clamped 0–1', () => {
    const r = parseColorInput('oklch(0.5 0.15 258)')
    expect(r?.oklch.l).toBeGreaterThanOrEqual(0)
    expect(r?.oklch.l).toBeLessThanOrEqual(1)
  })

  it('hex is lowercase', () => {
    const r = parseColorInput('#3B82F6')
    expect(r?.hex).toBe('#3b82f6')
  })
})
