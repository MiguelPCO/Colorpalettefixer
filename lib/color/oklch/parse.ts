import { parse, oklch } from 'culori'
import type { OKLCH } from '../types'

export function parseToOklch(input: string): OKLCH | null {
  if (!input || !input.trim()) return null

  try {
    const parsed = parse(input.trim())
    if (!parsed) return null

    const converted = oklch(parsed)
    if (!converted) return null

    const l = Math.max(0, Math.min(1, converted.l ?? 0))
    const c = Math.max(0, converted.c ?? 0)
    // hue is undefined for achromatic (c ≈ 0) — normalize to 0
    const rawH = converted.h
    const h = rawH === undefined || isNaN(rawH) ? 0 : ((rawH % 360) + 360) % 360

    return { l, c, h }
  } catch {
    return null
  }
}

export function isAchromatic(oklchColor: OKLCH): boolean {
  return oklchColor.c < 0.04
}
