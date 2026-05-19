import { parse, formatHex } from 'culori'
import { parseToOklch } from './oklch/parse'
import { oklchToHex } from './oklch/format'
import type { OKLCH } from './types'

/**
 * Normalizes bare number formats to CSS color strings before culori parsing.
 * Supported bare formats:
 *   "59, 130, 246"      → rgb(59 130 246)
 *   "217, 91%, 60%"     → hsl(217 91% 60%)
 *   "0.63, 0.19, 258"   → oklch(0.63 0.19 258)
 *   "3b82f6"            → #3b82f6
 */
function normalize(raw: string): string {
  const s = raw.trim()

  // Already prefixed — pass through to culori
  if (/^(#|rgb|hsl|hwb|oklch|oklab|lch|lab)/i.test(s)) return s

  // Bare 6-char hex (no #)
  if (/^[0-9a-fA-F]{6}$/.test(s)) return `#${s}`

  // Contains % → HSL  "217 91% 60%"  or  "217, 91%, 60%"
  if (s.includes('%')) {
    const m = /^([\d.]+)[,\s]+([\d.]+)\s*%[,\s]+([\d.]+)\s*%$/.exec(s)
    if (m) return `hsl(${m[1]} ${m[2]}% ${m[3]}%)`
  }

  // Three bare numbers — distinguish RGB vs OKLCH
  const m = /^([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)$/.exec(s)
  if (m) {
    const [, a, b, c] = m
    // OKLCH: L is 0–1 with explicit decimal  e.g. "0.63 0.19 258"
    if (a!.includes('.') && parseFloat(a!) <= 1.0) return `oklch(${a} ${b} ${c})`
    // RGB: integer values 0–255
    return `rgb(${a} ${b} ${c})`
  }

  return s
}

export function parseColorInput(raw: string): { hex: string; oklch: OKLCH } | null {
  if (!raw.trim()) return null

  const normalized = normalize(raw.trim())

  const oklchResult = parseToOklch(normalized)
  if (!oklchResult) return null

  const culoriParsed = parse(normalized)
  const hex = culoriParsed
    ? (formatHex(culoriParsed) ?? oklchToHex(oklchResult))
    : oklchToHex(oklchResult)

  return { hex: hex.toLowerCase(), oklch: oklchResult }
}
