import { HARMONY_TEMPLATES, HARMONY_THRESHOLD_HIGH, HARMONY_THRESHOLD_MEDIUM } from './templates'
import { angularDistance } from './balance'
import type { OKLCH, HarmonyDetection } from '../types'

function matchError(hues: number[], offsets: number[], baseHue: number): number {
  const expected = offsets.map(o => (baseHue + o + 360) % 360)
  const matched = new Set<number>()
  let totalError = 0

  for (const h of hues) {
    let bestError = Infinity
    let bestIdx = -1

    for (let i = 0; i < expected.length; i++) {
      // If we have enough offsets for 1-to-1 matching, don't reuse offsets.
      // Otherwise (like in 'mono'), allow reuse.
      if (expected.length >= hues.length && matched.has(i)) continue

      const err = angularDistance(h, expected[i]!)
      if (err < bestError) {
        bestError = err
        bestIdx = i
      }
    }

    if (bestIdx !== -1) {
      matched.add(bestIdx)
      totalError += bestError
    } else {
      // Fallback: if all offsets are matched but we still have hues, 
      // match to the closest one anyway (should only happen if logic above changes)
      let fallbackError = Infinity
      for (let i = 0; i < expected.length; i++) {
        const err = angularDistance(h, expected[i]!)
        if (err < fallbackError) fallbackError = err
      }
      totalError += fallbackError
    }
  }
  return totalError / hues.length
}

export function detectHarmony(colors: OKLCH[]): HarmonyDetection {
  // Exclude achromatic colors
  const chromatic = colors.filter(c => c.c >= 0.04)
  if (chromatic.length < 2) {
    return { template: 'mono', baseHue: colors[0]?.h ?? 0, error: 0, confidence: 'none' }
  }

  const hues = chromatic.map(c => c.h)
  let bestTemplate = 'mono' as HarmonyDetection['template']
  let bestError = Infinity
  let bestBase = 0

  for (const [template, offsets] of Object.entries(HARMONY_TEMPLATES) as [HarmonyDetection['template'], number[]][]) {
    if (offsets.length !== hues.length && offsets.length > 1) continue
    // Try 360 base hue rotations in 1° steps
    for (let base = 0; base < 360; base++) {
      const err = matchError(hues, offsets, base)
      if (err < bestError) {
        bestError = err
        bestTemplate = template
        bestBase = base
      }
    }
  }

  const confidence: HarmonyDetection['confidence'] =
    bestError < HARMONY_THRESHOLD_HIGH ? 'high' :
    bestError < HARMONY_THRESHOLD_MEDIUM ? 'medium' :
    bestError < 30 ? 'low' : 'none'

  return { template: bestTemplate, baseHue: bestBase, error: bestError, confidence }
}
