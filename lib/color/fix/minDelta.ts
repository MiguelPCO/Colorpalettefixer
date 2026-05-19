import { wcagContrast } from '../contrast/wcag'
import { apcaContrast } from '../contrast/apca'
import { oklchToRgb, isInSrgb } from '../oklch/format'
import { mapToSrgb } from '../oklch/gamut'
import type { OKLCH, FixSuggestion, ColorId } from '../types'

interface FixConstraint {
  type: 'wcag-aa'
  background: OKLCH
}

// Must satisfy BOTH thresholds to match the diagnostic rule (WCAG < 4.5 OR APCA |Lc| < 60)
function satisfiesContrast(candidate: OKLCH, bg: OKLCH): boolean {
  const fgRgb = oklchToRgb(candidate)
  const bgRgb = oklchToRgb(bg)
  return wcagContrast(fgRgb, bgRgb) >= 4.5 && Math.abs(apcaContrast(fgRgb, bgRgb)) >= 60
}

const L_STEPS = [0.02, 0.04, 0.06, 0.08, 0.10, 0.13, 0.16, 0.20, 0.25, 0.30]
const H_STEPS = [3, 5]
const C_STEPS = [0.03, 0.06, 0.10, 0.15]

export function fixByLAdjust(
  color: OKLCH,
  bg: OKLCH,
  targetColorId: ColorId,
): FixSuggestion | null {
  for (const step of L_STEPS) {
    for (const dir of [+1, -1]) {
      const candidate: OKLCH = {
        l: Math.max(0, Math.min(1, color.l + dir * step)),
        c: color.c,
        h: color.h,
      }
      const mapped = isInSrgb(candidate) ? candidate : mapToSrgb(candidate)
      if (satisfiesContrast(mapped, bg)) {
        const dL = mapped.l - color.l
        return {
          targetColorId,
          newOklch: mapped,
          delta: { dL, dC: 0, dH: 0 },
          explanation: `Lightness adjusted by ΔL ${dL > 0 ? '+' : ''}${dL.toFixed(3)} (hue and chroma preserved).`,
          preservedAxis: 'hue',
          highDelta: Math.abs(dL) > 0.15,
        }
      }
    }
  }
  return null
}

export function fixByHAdjust(
  color: OKLCH,
  bg: OKLCH,
  targetColorId: ColorId,
): FixSuggestion | null {
  for (const dH of H_STEPS.flatMap(s => [-s, s])) {
    const candidate: OKLCH = {
      l: color.l,
      c: color.c,
      h: (color.h + dH + 360) % 360,
    }
    const mapped = isInSrgb(candidate) ? candidate : mapToSrgb(candidate)
    if (satisfiesContrast(mapped, bg)) {
      return {
        targetColorId,
        newOklch: mapped,
        delta: { dL: 0, dC: 0, dH },
        explanation: `Hue shifted by ${dH > 0 ? '+' : ''}${dH}° (lightness and chroma preserved).`,
        preservedAxis: 'chroma',
        highDelta: false,
      }
    }
  }
  return null
}

export function fixByChadjust(
  color: OKLCH,
  bg: OKLCH,
  targetColorId: ColorId,
): FixSuggestion | null {
  for (const dC of C_STEPS.flatMap(s => [-s, s])) {
    const candidate: OKLCH = {
      l: color.l,
      c: Math.max(0, color.c + dC),
      h: color.h,
    }
    const mapped = isInSrgb(candidate) ? candidate : mapToSrgb(candidate)
    if (satisfiesContrast(mapped, bg)) {
      return {
        targetColorId,
        newOklch: mapped,
        delta: { dL: 0, dC, dH: 0 },
        explanation: `Chroma adjusted by ΔC ${dC > 0 ? '+' : ''}${dC.toFixed(3)} (lightness and hue preserved).`,
        preservedAxis: 'lightness',
        highDelta: Math.abs(dC) > 0.10,
      }
    }
  }
  return null
}

export function fixMinDelta(
  color: OKLCH,
  constraint: FixConstraint,
  targetColorId: ColorId = 'unknown',
): FixSuggestion | null {
  const bg = constraint.background
  if (satisfiesContrast(color, bg)) return null
  return (
    fixByLAdjust(color, bg, targetColorId) ??
    fixByHAdjust(color, bg, targetColorId) ??
    fixByChadjust(color, bg, targetColorId)
  )
}
