import { wcagContrast } from '../contrast/wcag'
import { oklchToRgb } from '../oklch/format'
import type { OKLCH, Role } from '../types'

function angularDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360
  return diff > 180 ? 360 - diff : diff
}

function hueSimilarity(h: number, target: number): number {
  return Math.max(0, 1 - angularDistance(h, target) / 60)
}

const WHITE_RGB = { r: 255, g: 255, b: 255 }

export function fitness(oklch: OKLCH, role: Role): number {
  const { l, c, h } = oklch

  switch (role) {
    case 'primary': {
      const rgb = oklchToRgb(oklch)
      const a11y = Math.min(1, wcagContrast(rgb, WHITE_RGB) / 4.5)
      return c * 2 * (1 - Math.abs(l - 0.5)) * a11y
    }
    case 'secondary':
      return c * 1.5 * (1 - Math.abs(l - 0.55))
    case 'accent':
      return c * 2.5 * (1 - Math.abs(l - 0.5))
    case 'neutral':
      return 1 / (1 + 10 * c)
    case 'background':
      return Math.max(0, (l - 0.85) * 5) * Math.max(0, 0.10 - c) * 10
    case 'surface':
      return Math.max(0, (l - 0.80) * 4) * Math.max(0, 0.12 - c) * 8
    case 'text': {
      const rgb = oklchToRgb(oklch)
      const a11y = Math.min(1, wcagContrast(rgb, WHITE_RGB) / 7)
      return Math.max(0, 0.30 - l) * 3 * (1 + c * 0.5) * a11y
    }
    case 'border':
      return (1 - Math.abs(l - 0.65)) * (1 - c * 5)
    case 'success':
      return hueSimilarity(h, 145) * Math.min(1, c / 0.10) * (1 - Math.abs(l - 0.55))
    case 'warning':
      return hueSimilarity(h, 65) * Math.min(1, c / 0.10) * (1 - Math.abs(l - 0.70))
    case 'error':
      return hueSimilarity(h, 25) * Math.min(1, c / 0.10) * (1 - Math.abs(l - 0.55))
    case 'info':
      return hueSimilarity(h, 230) * Math.min(1, c / 0.10) * (1 - Math.abs(l - 0.55))
    default:
      return 0
  }
}
