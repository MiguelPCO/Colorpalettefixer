import { isInSrgb } from '../oklch/format'
import type { OKLCH } from '../types'

export interface RampValidation {
  isValid: boolean
  errors: string[]
}

export function validateRamp(ramp: OKLCH[], mode: 'light' | 'dark'): RampValidation {
  const errors: string[] = []

  if (ramp.length !== 12) {
    errors.push(`Ramp must have exactly 12 steps, found ${ramp.length}`)
  }

  // Check monotonicity
  for (let i = 1; i < ramp.length; i++) {
    const prevL = ramp[i - 1]!.l
    const currL = ramp[i]!.l
    if (mode === 'light') {
      if (currL > prevL) {
        errors.push(`Lightness is not decreasing at step ${i + 1}: ${prevL} -> ${currL}`)
      }
    } else {
      if (currL < prevL) {
        errors.push(`Lightness is not increasing at step ${i + 1}: ${prevL} -> ${currL}`)
      }
    }
  }

  // Check gamut
  for (let i = 0; i < ramp.length; i++) {
    if (!isInSrgb(ramp[i]!)) {
      errors.push(`Step ${i + 1} is out of sRGB gamut`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
