import { wcagContrast } from './wcag'
import { apcaContrast, apcaPolarity } from './apca'
import type { RGB, ContrastReport, ColorId } from '../types'

export function buildContrastReport(
  fgId: ColorId,
  bgId: ColorId,
  fg: RGB,
  bg: RGB,
  cvdResults: ContrastReport['cvd'],
): ContrastReport {
  const ratio = wcagContrast(fg, bg)
  const lc = apcaContrast(fg, bg)
  const absLc = Math.abs(lc)

  const wcag = {
    ratio,
    AA_normal: ratio >= 4.5,
    AA_large: ratio >= 3,
    AAA_normal: ratio >= 7,
    AAA_large: ratio >= 4.5,
    nonText: ratio >= 3,
  }

  const apca = {
    lc,
    polarity: apcaPolarity(lc),
    meetsLc75: absLc >= 75,
    meetsLc60: absLc >= 60,
    meetsLc45: absLc >= 45,
  }

  const failsCvd = Object.values(cvdResults).some(r => !r.pass)

  let classification: ContrastReport['classification']
  if (failsCvd) classification = 'fail-CVD'
  else if (!wcag.AA_normal) classification = 'fail'
  else if (!wcag.AAA_normal && absLc < 60) classification = 'warn'
  else if (wcag.AAA_normal && absLc >= 75) classification = 'pass-AAA'
  else classification = 'pass-AA'

  return { fg: fgId, bg: bgId, wcag, apca, cvd: cvdResults, classification }
}
