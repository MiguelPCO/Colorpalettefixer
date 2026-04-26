import { clampChroma } from 'culori'
import type { OKLCH } from '../types'

// Map out-of-gamut OKLCH to sRGB by reducing chroma, preserving L and H
export function mapToSrgb(color: OKLCH): OKLCH {
  const clamped = clampChroma(
    { mode: 'oklch' as const, l: color.l, c: color.c, h: color.h },
    'oklch',
    'rgb',
  )

  return {
    l: clamped.l ?? color.l,
    c: Math.max(0, clamped.c ?? 0),
    h: clamped.h ?? color.h,
  }
}

// Returns how much chroma was reduced as a fraction [0, 1]
export function chromaReductionRatio(original: OKLCH, mapped: OKLCH): number {
  if (original.c === 0) return 0
  return (original.c - mapped.c) / original.c
}
