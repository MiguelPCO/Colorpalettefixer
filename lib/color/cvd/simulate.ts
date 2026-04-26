import { simulate as cvdSimulate } from '@bjornlu/colorblind'
import type { RGB } from '../types'

export type CvdType = 'deuteranopia' | 'protanopia' | 'tritanopia' | 'achromatopsia'

export function simulateCvd(rgb: RGB, type: CvdType): RGB {
  const result = cvdSimulate({ r: rgb.r, g: rgb.g, b: rgb.b }, type)
  return { r: Math.round(result.r), g: Math.round(result.g), b: Math.round(result.b) }
}
