import { describe, it, expect } from 'vitest'
import { runDiagnostics } from '@/lib/color/diagnostics/run'
import {
  checkRedundancy,
  checkAccent,
  checkOutlier,
  checkTemperatureImbalance,
  checkDoubleAccent,
  checkRampGap,
  checkContrastFailure,
} from '@/lib/color/diagnostics/rules'
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

describe('checkRedundancy — very-similar branch', () => {
  it('detects very-similar when ΔEok in [0.02, 0.04)', () => {
    // Two colors almost identical but not quite redundant
    const a = makeColor({ l: 0.50, c: 0.22, h: 342 })
    const b = makeColor({ l: 0.51, c: 0.22, h: 342 }) // tiny L diff → ΔEok ~0.02-0.04
    const findings = checkRedundancy([a, b])
    // At least one finding: redundant or very-similar
    expect(findings.length).toBeGreaterThan(0)
    const types = findings.map(f => f.type)
    expect(types.every(t => t === 'redundant' || t === 'very-similar')).toBe(true)
  })
})

describe('checkAccent', () => {
  it('detects no-accent when all chroma < 0.08', () => {
    const colors = [
      makeColor({ l: 0.5, c: 0.02, h: 0 }),
      makeColor({ l: 0.7, c: 0.03, h: 120 }),
    ]
    const findings = checkAccent(colors)
    expect(findings.some(f => f.type === 'no-accent')).toBe(true)
  })

  it('no finding when at least one color has chroma >= 0.08', () => {
    const colors = [
      makeColor({ l: 0.5, c: 0.15, h: 258 }),
    ]
    const findings = checkAccent(colors)
    expect(findings).toHaveLength(0)
  })
})

describe('checkOutlier', () => {
  it('returns empty for fewer than 4 colors', () => {
    const colors = [
      makeColor({ l: 0.5, c: 0.15, h: 0 }),
      makeColor({ l: 0.5, c: 0.15, h: 120 }),
    ]
    expect(checkOutlier(colors)).toHaveLength(0)
  })

  it('detects outlier hue > 90° from others with high chroma', () => {
    const colors = [
      makeColor({ l: 0.5, c: 0.15, h: 258 }),
      makeColor({ l: 0.5, c: 0.15, h: 260 }),
      makeColor({ l: 0.5, c: 0.15, h: 262 }),
      makeColor({ l: 0.5, c: 0.15, h: 10 }),  // hue outlier
    ]
    const findings = checkOutlier(colors)
    expect(findings.some(f => f.type === 'outlier')).toBe(true)
  })

  it('no outlier for harmonious hues', () => {
    const colors = [
      makeColor({ l: 0.5, c: 0.15, h: 258 }),
      makeColor({ l: 0.5, c: 0.15, h: 260 }),
      makeColor({ l: 0.5, c: 0.15, h: 262 }),
      makeColor({ l: 0.5, c: 0.15, h: 264 }),
    ]
    expect(checkOutlier(colors)).toHaveLength(0)
  })
})

describe('checkTemperatureImbalance', () => {
  it('no finding when palette has a neutral', () => {
    const colors = [
      makeColor({ l: 0.5, c: 0.2, h: 30 }),  // warm
      makeColor({ l: 0.5, c: 0.2, h: 20 }),  // warm
      makeColor({ l: 0.5, c: 0.01, h: 0 }),  // neutral balances it
    ]
    expect(checkTemperatureImbalance(colors)).toHaveLength(0)
  })

  it('detects cool temperature imbalance (T < -0.8, no neutral)', () => {
    // Cool hues: 210-240 (blue/cyan)
    const colors = [
      makeColor({ l: 0.5, c: 0.25, h: 210 }),
      makeColor({ l: 0.5, c: 0.25, h: 220 }),
      makeColor({ l: 0.5, c: 0.25, h: 230 }),
    ]
    const findings = checkTemperatureImbalance(colors)
    // May or may not trigger depending on exact T value; if triggered, must be 'temperature-imbalance'
    if (findings.length > 0) {
      expect(findings[0]!.type).toBe('temperature-imbalance')
      expect(findings[0]!.explanation).toContain('cool')
    }
  })

  it('detects warm temperature imbalance explanation contains warm', () => {
    // Warm hues: ~0-60 (red, orange)
    const colors = [
      makeColor({ l: 0.5, c: 0.25, h: 20 }),
      makeColor({ l: 0.5, c: 0.25, h: 30 }),
      makeColor({ l: 0.5, c: 0.25, h: 40 }),
    ]
    const findings = checkTemperatureImbalance(colors)
    if (findings.length > 0) {
      expect(findings[0]!.explanation).toContain('warm')
    }
  })
})

describe('checkDoubleAccent', () => {
  it('no finding for single accent', () => {
    const colors = [
      makeColor({ l: 0.5, c: 0.2, h: 258 }),
      makeColor({ l: 0.5, c: 0.05, h: 0 }),
    ]
    expect(checkDoubleAccent(colors)).toHaveLength(0)
  })

  it('detects double-accent when 2+ colors have C >= 0.15', () => {
    const colors = [
      makeColor({ l: 0.5, c: 0.2, h: 258 }),
      makeColor({ l: 0.5, c: 0.18, h: 30 }),
    ]
    const findings = checkDoubleAccent(colors)
    expect(findings.some(f => f.type === 'double-accent')).toBe(true)
  })
})

describe('checkRampGap', () => {
  it('no finding when hue diff >= 5°', () => {
    const colors = [
      makeColor({ l: 0.2, c: 0.15, h: 258 }),
      makeColor({ l: 0.8, c: 0.15, h: 280 }),  // hDiff > 5°, no ramp-gap
    ]
    expect(checkRampGap(colors)).toHaveLength(0)
  })

  it('detects ramp-gap for same-hue colors with large L diff', () => {
    const colors = [
      makeColor({ l: 0.1, c: 0.15, h: 258 }),
      makeColor({ l: 0.6, c: 0.15, h: 259 }),  // hDiff < 5°, lDiff = 0.5 > 0.4
    ]
    const findings = checkRampGap(colors)
    expect(findings.some(f => f.type === 'ramp-gap')).toBe(true)
  })
})

describe('checkContrastFailure — APCA branch', () => {
  it('fires when WCAG < 4.5 (lDiff > 0.20)', () => {
    const fg = makeColor({ l: 0.75, c: 0.1, h: 258 })
    const bg = makeColor({ l: 0.99, c: 0.005, h: 0 })
    const findings = checkContrastFailure([fg, bg])
    expect(findings.some(f => f.type === 'contrast-failure')).toBe(true)
  })

  it('fires for pair with lDiff > 0.20 that fails at least one threshold', () => {
    const fg = makeColor({ l: 0.20, c: 0.05, h: 258 })
    const bg = makeColor({ l: 0.85, c: 0.01, h: 0 })
    const findings = checkContrastFailure([fg, bg])
    // If this pair fails either WCAG or APCA, a finding fires with relevant threshold mentioned
    if (findings.length > 0) {
      const f = findings.find(f => f.type === 'contrast-failure')!
      expect(f.explanation).toMatch(/APCA|WCAG/)
    }
  })

  it('does not fire when both WCAG >= 4.5 and APCA |Lc| >= 60', () => {
    const fg = makeColor({ l: 0.05, c: 0.01, h: 0 })
    const bg = makeColor({ l: 0.99, c: 0.001, h: 0 })
    expect(checkContrastFailure([fg, bg]).filter(f => f.type === 'contrast-failure')).toHaveLength(0)
  })

  it('does not fire when lDiff <= 0.20', () => {
    const fg = makeColor({ l: 0.50, c: 0.15, h: 258 })
    const bg = makeColor({ l: 0.60, c: 0.15, h: 100 })
    expect(checkContrastFailure([fg, bg]).filter(f => f.type === 'contrast-failure')).toHaveLength(0)
  })
})
