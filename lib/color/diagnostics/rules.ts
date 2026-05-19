import { deltaEok } from '../cvd/deltaE'
import { wcagContrast } from '../contrast/wcag'
import { apcaContrast } from '../contrast/apca'
import { temperatureBalance } from '../harmony/balance'
import { FINDING_SEVERITY, FINDING_RULE_LABEL } from './severity'
import { nanoid } from 'nanoid'
import type { Color, Finding, FindingType } from '../types'

function finding(type: FindingType, affectedColorIds: string[], explanation: string): Finding {
  return {
    id: nanoid(8),
    type,
    severity: FINDING_SEVERITY[type],
    affectedColorIds,
    rule: getRuleLabel(type),
    ruleLabel: FINDING_RULE_LABEL[type],
    explanation,
  }
}

function getRuleLabel(type: FindingType): string {
  const labels: Record<FindingType, string> = {
    'redundant':            'ΔEok < 0.02 (imperceptible difference)',
    'very-similar':         '0.02 ≤ ΔEok < 0.04 (very similar)',
    'outlier':              'Distance > median + 3·MAD from palette centroid',
    'no-neutral':           'min(C) > 0.04 — no achromatic or near-neutral color',
    'no-accent':            'max(C) < 0.08 — no chromatic accent present',
    'no-hierarchy':         'max(L) − min(L) < 0.25 — insufficient lightness range',
    'double-accent':        'Two+ colors with C ≥ 0.15 without harmonic relationship',
    'ramp-gap':             'ΔL > 0.15 between adjacent same-hue colors',
    'temperature-imbalance': '|T| > 0.8 with no neutral to balance',
    'contrast-failure':     'WCAG 4.5:1 or APCA |Lc| 60 — contrast minimum for normal text',
  }
  return labels[type]
}

export function checkRedundancy(colors: Color[]): Finding[] {
  const findings: Finding[] = []
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const d = deltaEok(colors[i]!.rgb, colors[j]!.rgb)
      if (d < 0.02) {
        findings.push(finding('redundant', [colors[i]!.id, colors[j]!.id],
          `Colors are perceptually identical (ΔEok ${d.toFixed(3)} < 0.02). Consider removing one.`))
      } else if (d < 0.04) {
        findings.push(finding('very-similar', [colors[i]!.id, colors[j]!.id],
          `Colors are very similar (ΔEok ${d.toFixed(3)}). Verify both are needed.`))
      }
    }
  }
  return findings
}

export function checkNeutral(colors: Color[]): Finding[] {
  if (colors.length < 3) return []
  const hasNeutral = colors.some(c => c.oklch.c < 0.04)
  if (!hasNeutral) {
    return [finding('no-neutral', colors.map(c => c.id),
      'No neutral color found. A UI system needs at least one gray for backgrounds, borders, and secondary text.')]
  }
  return []
}

export function checkAccent(colors: Color[]): Finding[] {
  const maxC = Math.max(...colors.map(c => c.oklch.c))
  if (maxC < 0.08) {
    return [finding('no-accent', colors.map(c => c.id),
      `No chromatic accent found (max chroma ${maxC.toFixed(3)} < 0.08). UI needs a focal color for interactive elements.`)]
  }
  return []
}

export function checkHierarchy(colors: Color[]): Finding[] {
  const ls = colors.map(c => c.oklch.l)
  if (ls.length === 0) return []
  const range = Math.max(...ls) - Math.min(...ls)
  if (range < 0.25) {
    return [finding('no-hierarchy', colors.map(c => c.id),
      `Lightness range ${range.toFixed(2)} < 0.25. Add a very light or very dark color to create visual hierarchy.`)]
  }
  return []
}

export function checkContrastFailure(colors: Color[]): Finding[] {
  if (colors.length < 2) return []
  const findings: Finding[] = []

  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const ci = colors[i]!
      const cj = colors[j]!
      const lDiff = Math.abs(ci.oklch.l - cj.oklch.l)
      if (lDiff <= 0.20) continue
      const ratio = wcagContrast(ci.rgb, cj.rgb)
      const lc = apcaContrast(ci.rgb, cj.rgb)
      const absLc = Math.abs(lc)
      const wcagFailed = ratio < 4.5
      const apcaFailed = absLc < 60
      if (!wcagFailed && !apcaFailed) continue
      let explanation: string
      if (wcagFailed && apcaFailed) {
        explanation = `WCAG ratio ${ratio.toFixed(2)}:1 < 4.5:1 and APCA |Lc| ${absLc.toFixed(1)} < 60 — both thresholds fail. Adjust lightness to meet AA.`
      } else if (wcagFailed) {
        explanation = `WCAG ratio ${ratio.toFixed(2)}:1 < 4.5:1 — APCA |Lc| ${absLc.toFixed(1)} passes but WCAG does not. Adjust lightness to meet AA.`
      } else {
        explanation = `APCA |Lc| ${absLc.toFixed(1)} < 60 — WCAG ratio ${ratio.toFixed(2)}:1 passes but APCA does not. Adjust lightness for perceptual contrast.`
      }
      findings.push(finding('contrast-failure', [ci.id, cj.id], explanation))
    }
  }
  return findings
}

export function checkDoubleAccent(colors: Color[]): Finding[] {
  const accents = colors.filter(c => c.oklch.c >= 0.15)
  if (accents.length > 1) {
    return [finding('double-accent', accents.map(c => c.id),
      `${accents.length} competing accent colors (C ≥ 0.15). Prioritize one or harmonize them.`)]
  }
  return []
}

export function checkRampGap(colors: Color[]): Finding[] {
  // Simplified: check if any two colors with similar hue have a large L gap without intermediate
  // (In a real ramp, we'd check steps, but here we just check for large gaps in palette)
  const findings: Finding[] = []
  const sorted = [...colors].sort((a, b) => a.oklch.h - b.oklch.h)
  
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const c1 = sorted[i]!
      const c2 = sorted[j]!
      const hDiff = Math.abs(c1.oklch.h - c2.oklch.h)
      const lDiff = Math.abs(c1.oklch.l - c2.oklch.l)
      
      if (hDiff < 5 && lDiff > 0.4) {
        // Large gap in same hue
        findings.push(finding('ramp-gap', [c1.id, c2.id], 
          `Large lightness gap (${lDiff.toFixed(2)}) between colors of similar hue. Consider adding an intermediate step.`))
      }
    }
  }
  return findings
}

function angularDist(a: number, b: number): number {
  const d = ((a - b) % 360 + 360) % 360
  return d > 180 ? 360 - d : d
}

function circularMeanHue(hues: number[]): number {
  const sinSum = hues.reduce((s, h) => s + Math.sin(h * Math.PI / 180), 0)
  const cosSum = hues.reduce((s, h) => s + Math.cos(h * Math.PI / 180), 0)
  return ((Math.atan2(sinSum / hues.length, cosSum / hues.length) * 180 / Math.PI) + 360) % 360
}

function median(vals: number[]): number {
  const sorted = [...vals].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!
}

export function checkOutlier(colors: Color[]): Finding[] {
  if (colors.length < 4) return []
  const chromatic = colors.filter(c => c.oklch.c > 0.1)
  if (chromatic.length < 3) return []

  const centroid = circularMeanHue(chromatic.map(c => c.oklch.h))
  const dists = chromatic.map(c => angularDist(c.oklch.h, centroid))
  const med = median(dists)
  const mad = median(dists.map(d => Math.abs(d - med)))
  const threshold = Math.max(med + 3 * mad, 45)

  const findings: Finding[] = []
  for (let i = 0; i < chromatic.length; i++) {
    if (dists[i]! > threshold) {
      findings.push(finding('outlier', [chromatic[i]!.id],
        `Hue outlier: ${dists[i]!.toFixed(0)}° from palette centroid (threshold ${threshold.toFixed(0)}°). Verify it fits the harmony.`))
    }
  }
  return findings
}

export function checkTemperatureImbalance(colors: Color[]): Finding[] {
  const hasNeutral = colors.some(c => c.oklch.c < 0.04)
  const T = temperatureBalance(colors.map(c => c.oklch))
  if (Math.abs(T) > 0.8 && !hasNeutral) {
    const dir = T > 0 ? 'warm' : 'cool'
    return [finding('temperature-imbalance', colors.map(c => c.id),
      `Palette is strongly ${dir} (T = ${T.toFixed(2)}) with no neutral to balance. Consider adding a neutral.`)]
  }
  return []
}
