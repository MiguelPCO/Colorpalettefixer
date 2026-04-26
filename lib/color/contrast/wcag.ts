import type { RGB } from '../types'

/**
 * Calculate relative luminance per WCAG 2.2 SC 1.4.1
 * https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 */
export function relativeLuminance(rgb: RGB): number {
  const toLinear = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b)
}

/**
 * Calculate WCAG 2.2 contrast ratio
 * https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
 */
export function wcagContrast(fg: RGB, bg: RGB): number {
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Determine WCAG conformance level given a contrast ratio
 */
export function wcagPassLevel(
  ratio: number,
  isLargeText: boolean,
): 'AAA' | 'AA' | 'AA-large' | 'fail' {
  if (!isLargeText && ratio >= 7) return 'AAA'
  if (!isLargeText && ratio >= 4.5) return 'AA'
  if (isLargeText && ratio >= 4.5) return 'AAA'
  if (isLargeText && ratio >= 3) return 'AA'
  if (ratio >= 3) return 'AA-large'
  return 'fail'
}
