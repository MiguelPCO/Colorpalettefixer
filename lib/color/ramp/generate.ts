import { RAMP_L_LIGHT, RAMP_L_DARK, RAMP_C_MULT } from './curves'
import { mapToSrgb } from '../oklch/gamut'
import { wcagContrast } from '../contrast/wcag'
import { oklchToRgb, isInSrgb } from '../oklch/format'
import type { OKLCH } from '../types'

export { RAMP_L_LIGHT, RAMP_L_DARK }

// Generate 12-step Radix-like ramp from a brand OKLCH color
export function generateRamp(brand: OKLCH, mode: 'light' | 'dark'): OKLCH[] {
  const lTable = mode === 'light' ? RAMP_L_LIGHT : RAMP_L_DARK

  // Step 9 (index 8) is the brand color; adjust L if needed for WCAG AA.
  // Cap to lTable[7] so step 9 never has higher L than step 8 (monotonicity).
  let brandL = brand.l
  if (mode === 'light') {
    const white = { r: 255, g: 255, b: 255 }
    const maxBrandL = lTable[7] ?? brand.l
    let attempt = Math.min(brandL, maxBrandL)
    while (attempt >= 0.05) {
      const candidateRgb = oklchToRgb({ l: attempt, c: brand.c, h: brand.h })
      if (wcagContrast(candidateRgb, white) >= 4.5) { brandL = attempt; break }
      attempt = Math.round((attempt - 0.01) * 100) / 100
    }
  }

  const steps: OKLCH[] = []
  for (let i = 0; i < 12; i++) {
    const l = i === 8 ? brandL : lTable[i]!
    const c = brand.c * RAMP_C_MULT[i]!
    let color: OKLCH = { l, c, h: brand.h }

    if (!isInSrgb(color)) {
      color = mapToSrgb(color)
    }

    steps.push(color)
  }

  return steps
}
