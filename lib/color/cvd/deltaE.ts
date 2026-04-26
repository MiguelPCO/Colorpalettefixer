import { oklab } from 'culori'
import type { RGB } from '../types'

// ΔEok (OKLab Euclidean distance) between two RGB colors
// < 0.02 = imperceptible, < 0.10 = very similar, > 0.10 = distinguishable
export function deltaEok(a: RGB, b: RGB): number {
  const toOklab = (rgb: RGB) => oklab({
    mode: 'rgb',
    r: rgb.r / 255,
    g: rgb.g / 255,
    b: rgb.b / 255,
  })
  const labA = toOklab(a)
  const labB = toOklab(b)
  if (!labA || !labB) return 0

  const dL = (labA.l ?? 0) - (labB.l ?? 0)
  const da = (labA.a ?? 0) - (labB.a ?? 0)
  const db = (labA.b ?? 0) - (labB.b ?? 0)
  return Math.sqrt(dL * dL + da * da + db * db)
}
