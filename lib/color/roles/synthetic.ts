import type { OKLCH, Role } from '../types'
import { mapToSrgb } from '../oklch/gamut'
import { isInSrgb } from '../oklch/format'

const ROLE_TARGETS: Partial<Record<Role, { h: number; l: number }>> = {
  success: { h: 145, l: 0.55 },
  warning: { h: 65,  l: 0.70 },
  error:   { h: 25,  l: 0.55 },
  info:    { h: 230, l: 0.55 },
}

export function generateSynthetic(role: Role, primaryOklch: OKLCH): OKLCH {
  const target = ROLE_TARGETS[role]
  if (!target) return { l: 0.55, c: 0.12, h: 0 }

  const c = Math.max(0.08, Math.min(0.20, primaryOklch.c * 0.85))
  const candidate: OKLCH = { l: target.l, c, h: target.h }
  return isInSrgb(candidate) ? candidate : mapToSrgb(candidate)
}
