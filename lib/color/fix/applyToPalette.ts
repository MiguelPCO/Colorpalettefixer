import type { Finding, OKLCH } from '../types'

export interface ColorPatch {
  id: string
  newOklch: OKLCH
}

export function applyToPalette(findings: Finding[]): ColorPatch[] {
  const seen = new Set<string>()
  const patches: ColorPatch[] = []
  for (const f of findings) {
    if (!f.suggestion) continue
    const { targetColorId, newOklch } = f.suggestion
    if (seen.has(targetColorId)) continue
    seen.add(targetColorId)
    patches.push({ id: targetColorId, newOklch })
  }
  return patches
}
