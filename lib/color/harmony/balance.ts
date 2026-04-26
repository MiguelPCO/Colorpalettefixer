import type { OKLCH } from '../types'

// Circular mean of hues (angles in degrees)
export function circularMeanHue(hues: number[]): number {
  if (hues.length === 0) return 0
  const radians = hues.map(h => (h * Math.PI) / 180)
  const sinSum = radians.reduce((s, r) => s + Math.sin(r), 0)
  const cosSum = radians.reduce((s, r) => s + Math.cos(r), 0)
  const mean = Math.atan2(sinSum / hues.length, cosSum / hues.length)
  return ((mean * 180) / Math.PI + 360) % 360
}

// R: circular resultant length [0,1]. 1 = concentrated, 0 = dispersed
export function circularR(hues: number[]): number {
  if (hues.length === 0) return 0
  const radians = hues.map(h => (h * Math.PI) / 180)
  const sinSum = radians.reduce((s, r) => s + Math.sin(r), 0)
  const cosSum = radians.reduce((s, r) => s + Math.cos(r), 0)
  return Math.sqrt(sinSum * sinSum + cosSum * cosSum) / hues.length
}

// Temperature balance T: >0 warm, <0 cool
// Weighted by chroma (neutrals don't contribute)
export function temperatureBalance(colors: OKLCH[]): number {
  const chromatic = colors.filter(c => c.c >= 0.04)
  if (chromatic.length === 0) return 0
  const weightedSum = chromatic.reduce((s, c) => s + Math.cos(((c.h - 30) * Math.PI) / 180) * c.c, 0)
  const totalWeight = chromatic.reduce((s, c) => s + c.c, 0)
  return weightedSum / totalWeight
}

// Angular distance between two hues (shortest path on circle)
export function angularDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360
  return diff > 180 ? 360 - diff : diff
}
