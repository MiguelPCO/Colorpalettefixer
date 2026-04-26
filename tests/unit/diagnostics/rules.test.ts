import { describe, it, expect } from 'vitest'
import { runDiagnostics } from '@/lib/color/diagnostics/run'
import type { Color, OKLCH } from '@/lib/color/types'
import { nanoid } from 'nanoid'
import { oklchToRgb, oklchToHex, isInSrgb } from '@/lib/color/oklch/format'

function makeColor(oklch: OKLCH): Color {
  return { id: nanoid(8), oklch, hex: oklchToHex(oklch), rgb: oklchToRgb(oklch), inGamutSrgb: isInSrgb(oklch) }
}

describe('runDiagnostics', () => {
  it('detects redundant colors (ΔEok < 0.02)', () => {
    const colors = [
      makeColor({ l: 0.5, c: 0.22, h: 342 }),
      makeColor({ l: 0.5, c: 0.22, h: 342 }), // identical
      makeColor({ l: 0.9, c: 0.01, h: 0 }),
    ]
    const findings = runDiagnostics(colors)
    expect(findings.some(f => f.type === 'redundant')).toBe(true)
  })

  it('detects no-neutral when min(C) > 0.04', () => {
    const colors = [
      makeColor({ l: 0.5, c: 0.22, h: 258 }),
      makeColor({ l: 0.7, c: 0.15, h: 30 }),
      makeColor({ l: 0.3, c: 0.18, h: 120 }),
    ]
    const findings = runDiagnostics(colors)
    expect(findings.some(f => f.type === 'no-neutral')).toBe(true)
  })

  it('detects no-hierarchy when max(L) - min(L) < 0.25', () => {
    const colors = [
      makeColor({ l: 0.50, c: 0.15, h: 258 }),
      makeColor({ l: 0.55, c: 0.10, h: 30 }),
      makeColor({ l: 0.60, c: 0.05, h: 0 }),
    ]
    const findings = runDiagnostics(colors)
    expect(findings.some(f => f.type === 'no-hierarchy')).toBe(true)
  })

  it('detects contrast-failure for pair with WCAG < 4.5:1', () => {
    // We need two colors that are clearly text/bg candidates (lDiff > 0.2)
    // and have low contrast.
    // White bg (L=0.99) and a very light color (L=0.75)
    const colors = [
      makeColor({ l: 0.75, c: 0.1, h: 258 }), 
      makeColor({ l: 0.99, c: 0.005, h: 0 }),
    ]
    const findings = runDiagnostics(colors)
    expect(findings.some(f => f.type === 'contrast-failure')).toBe(true)
  })

  it('returns no critical findings for well-formed palette', () => {
    const colors = [
      makeColor({ l: 0.20, c: 0.22, h: 258 }),  // very dark primary
      makeColor({ l: 0.99, c: 0.001, h: 0 }),   // almost white bg
      makeColor({ l: 0.01, c: 0.001, h: 0 }),   // almost black text
    ]
    const findings = runDiagnostics(colors)
    expect(findings.filter(f => f.severity === 'critical')).toHaveLength(0)
  })
})
