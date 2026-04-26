import { describe, it, expect } from 'vitest'
import { assignRoles } from '@/lib/color/roles/assign'
import type { Color, OKLCH } from '@/lib/color/types'
import { nanoid } from 'nanoid'

function makeColor(oklch: OKLCH): Color {
  return {
    id: nanoid(8),
    oklch,
    hex: '#000000',
    rgb: { r: 0, g: 0, b: 0 },
    inGamutSrgb: true,
  }
}

describe('assignRoles', () => {
  it('assigns primary to most chromatic color', () => {
    const colors: Color[] = [
      makeColor({ l: 0.5, c: 0.22, h: 258 }),  // chromatic, good primary candidate
      makeColor({ l: 0.9, c: 0.01, h: 258 }),  // neutral/background
      makeColor({ l: 0.15, c: 0.03, h: 258 }), // dark text
    ]
    const { assignments } = assignRoles(colors)
    expect(assignments.primary).toBe(colors[0]!.id)
  })

  it('assigns background to lightest color', () => {
    const colors: Color[] = [
      makeColor({ l: 0.98, c: 0.005, h: 0 }), // very light neutral
      makeColor({ l: 0.5, c: 0.20, h: 120 }),
      makeColor({ l: 0.15, c: 0.02, h: 0 }),
    ]
    const { assignments } = assignRoles(colors)
    expect(assignments.background).toBe(colors[0]!.id)
  })

  it('assigns text to darkest color', () => {
    const colors: Color[] = [
      makeColor({ l: 0.99, c: 0.005, h: 0 }),
      makeColor({ l: 0.5, c: 0.20, h: 258 }),
      makeColor({ l: 0.14, c: 0.03, h: 258 }),
    ]
    const { assignments } = assignRoles(colors)
    expect(assignments.text).toBe(colors[2]!.id)
  })

  it('generates synthetic success if no green candidate', () => {
    const colors: Color[] = [
      makeColor({ l: 0.5, c: 0.22, h: 258 }),  // blue
      makeColor({ l: 0.9, c: 0.01, h: 258 }),
      makeColor({ l: 0.15, c: 0.02, h: 258 }),
    ]
    const { assignments, synthetics } = assignRoles(colors)
    expect(synthetics.some(s => s.role === 'success')).toBe(true)
    expect(assignments.success).toBeNull()
  })
})
