import { describe, it, expect } from 'vitest'
import { apcaContrast, apcaPolarity, apcaMinBodyFont } from '@/lib/color/contrast/apca'
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

describe('apcaPolarity', () => {
  it('positive Lc → dark-on-light', () => {
    expect(apcaPolarity(75)).toBe('dark-on-light')
  })

  it('negative Lc → light-on-dark', () => {
    expect(apcaPolarity(-75)).toBe('light-on-dark')
  })

  it('zero → dark-on-light', () => {
    expect(apcaPolarity(0)).toBe('dark-on-light')
  })
})

describe('apcaMinBodyFont', () => {
  it('|Lc| >= 90 → 12px', () => {
    expect(apcaMinBodyFont(92)).toBe(12)
    expect(apcaMinBodyFont(-95)).toBe(12)
  })

  it('|Lc| >= 75 → 14px', () => {
    expect(apcaMinBodyFont(80)).toBe(14)
    expect(apcaMinBodyFont(-78)).toBe(14)
  })

  it('|Lc| >= 60 → 16px', () => {
    expect(apcaMinBodyFont(65)).toBe(16)
  })

  it('|Lc| >= 45 → 18px', () => {
    expect(apcaMinBodyFont(50)).toBe(18)
  })

  it('|Lc| < 45 → 24px', () => {
    expect(apcaMinBodyFont(30)).toBe(24)
    expect(apcaMinBodyFont(0)).toBe(24)
  })
})
