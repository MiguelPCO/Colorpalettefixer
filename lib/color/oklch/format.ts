import { formatHex, rgb, inGamut } from 'culori'
import type { OKLCH, RGB } from '../types'

export function oklchToHex(color: OKLCH): string {
  const formatted = formatHex({ mode: 'oklch', l: color.l, c: color.c, h: color.h })
  return formatted ?? '#000000'
}

export function oklchToRgb(color: OKLCH): RGB {
  const converted = rgb({ mode: 'oklch', l: color.l, c: color.c, h: color.h })
  if (!converted) return { r: 0, g: 0, b: 0 }
  return {
    r: Math.round(Math.max(0, Math.min(255, (converted.r ?? 0) * 255))),
    g: Math.round(Math.max(0, Math.min(255, (converted.g ?? 0) * 255))),
    b: Math.round(Math.max(0, Math.min(255, (converted.b ?? 0) * 255))),
  }
}

export function isInSrgb(color: OKLCH): boolean {
  return inGamut('rgb')({ mode: 'oklch', l: color.l, c: color.c, h: color.h })
}

export function oklchToCss(color: OKLCH, alpha = 1): string {
  const alphaStr = alpha < 1 ? ` / ${alpha}` : ''
  return `oklch(${color.l.toFixed(4)} ${color.c.toFixed(4)} ${color.h.toFixed(2)}${alphaStr})`
}
