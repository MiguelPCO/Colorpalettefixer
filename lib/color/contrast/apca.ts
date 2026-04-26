import { APCAcontrast, sRGBtoY } from 'apca-w3'
import type { RGB } from '../types'

// Returns Lc value: positive = dark-on-light, negative = light-on-dark
export function apcaContrast(fg: RGB, bg: RGB): number {
  const fgY = sRGBtoY([fg.r, fg.g, fg.b])
  const bgY = sRGBtoY([bg.r, bg.g, bg.b])
  return APCAcontrast(fgY, bgY) as number
}

export function apcaPolarity(lc: number): 'light-on-dark' | 'dark-on-light' {
  return lc < 0 ? 'light-on-dark' : 'dark-on-light'
}

// Minimum body font size for given |Lc| (APCA Bronze Mode)
export function apcaMinBodyFont(lc: number): number {
  const absLc = Math.abs(lc)
  if (absLc >= 90) return 12
  if (absLc >= 75) return 14
  if (absLc >= 60) return 16
  if (absLc >= 45) return 18
  return 24
}
