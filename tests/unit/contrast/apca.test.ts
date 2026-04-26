import { describe, it, expect } from 'vitest'
import { apcaContrast } from '@/lib/color/contrast/apca'
import { APCA_GOLDEN } from '@/tests/golden/apca-pairs'
import { oklchToRgb } from '@/lib/color/oklch/format'
import { parseToOklch } from '@/lib/color/oklch/parse'

function hexToRgb(hex: string) {
  return oklchToRgb(parseToOklch(hex)!)
}

describe('apcaContrast', () => {
  it('golden set matches apca-w3 reference within ±2 Lc', () => {
    for (const pair of APCA_GOLDEN) {
      const lc = apcaContrast(hexToRgb(pair.fg), hexToRgb(pair.bg))
      expect(Math.abs(lc - pair.lc)).toBeLessThan(2)
    }
  })
})
