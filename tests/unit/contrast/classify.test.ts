import { describe, it, expect } from 'vitest'
import { classifyContrast, buildContrastReport } from '@/lib/color/contrast/classify'
import type { RGB, ContrastReport } from '@/lib/color/types'

const passAllCvd: ContrastReport['cvd'] = {
  deutan: { pass: true, deltaE: 0.01 },
  protan: { pass: true, deltaE: 0.01 },
  tritan: { pass: true, deltaE: 0.01 },
  achromatopsia: { pass: true, deltaE: 0.01 },
}

const failOneCvd: ContrastReport['cvd'] = {
  deutan: { pass: false, deltaE: 0.15 },
  protan: { pass: true, deltaE: 0.01 },
  tritan: { pass: true, deltaE: 0.01 },
  achromatopsia: { pass: true, deltaE: 0.01 },
}

const black: RGB = { r: 0, g: 0, b: 0 }
const white: RGB = { r: 255, g: 255, b: 255 }
const lightGray: RGB = { r: 200, g: 200, b: 200 }

describe('classifyContrast', () => {
  it('cvdFail=true → fail-CVD regardless of wcag/apca', () => {
    expect(classifyContrast(21, 108, true)).toBe('fail-CVD')
  })

  it('wcag < 4.5 → fail', () => {
    expect(classifyContrast(3.0, 50, false)).toBe('fail')
  })

  it('wcag >= 7 and |apca| >= 75 → pass-AAA', () => {
    expect(classifyContrast(8.0, 80, false)).toBe('pass-AAA')
  })

  it('wcag >= 7 and |apca| >= 75 (negative lc) → pass-AAA', () => {
    expect(classifyContrast(7.5, -78, false)).toBe('pass-AAA')
  })

  it('wcag in [4.5, 7) and |apca| < 60 → warn', () => {
    expect(classifyContrast(5.0, 40, false)).toBe('warn')
  })

  it('wcag in [4.5, 7) and |apca| >= 60 → pass-AA', () => {
    expect(classifyContrast(5.5, 65, false)).toBe('pass-AA')
  })

  it('wcag >= 7 and |apca| < 75 → pass-AA', () => {
    expect(classifyContrast(7.5, 60, false)).toBe('pass-AA')
  })
})

describe('buildContrastReport', () => {
  it('black on white → pass-AAA', () => {
    const report = buildContrastReport('fg1', 'bg1', black, white, passAllCvd)
    expect(report.classification).toBe('pass-AAA')
    expect(report.wcag.AA_normal).toBe(true)
    expect(report.wcag.AAA_normal).toBe(true)
    expect(report.fg).toBe('fg1')
    expect(report.bg).toBe('bg1')
  })

  it('white on white → fail', () => {
    const report = buildContrastReport('fg2', 'bg2', white, white, passAllCvd)
    expect(report.classification).toBe('fail')
    expect(report.wcag.ratio).toBeCloseTo(1, 1)
    expect(report.wcag.AA_normal).toBe(false)
  })

  it('cvd failure overrides classification → fail-CVD', () => {
    const report = buildContrastReport('fg3', 'bg3', black, white, failOneCvd)
    expect(report.classification).toBe('fail-CVD')
  })

  it('report contains wcag, apca, cvd fields', () => {
    const report = buildContrastReport('fg4', 'bg4', black, white, passAllCvd)
    expect(report.wcag).toHaveProperty('ratio')
    expect(report.wcag).toHaveProperty('AA_normal')
    expect(report.wcag).toHaveProperty('AA_large')
    expect(report.wcag).toHaveProperty('AAA_normal')
    expect(report.wcag).toHaveProperty('AAA_large')
    expect(report.wcag).toHaveProperty('nonText')
    expect(report.apca).toHaveProperty('lc')
    expect(report.apca).toHaveProperty('polarity')
    expect(report.apca).toHaveProperty('meetsLc75')
    expect(report.apca).toHaveProperty('meetsLc60')
    expect(report.apca).toHaveProperty('meetsLc45')
  })

  it('lightGray on white → fail (low contrast)', () => {
    const report = buildContrastReport('fg5', 'bg5', lightGray, white, passAllCvd)
    expect(report.wcag.AA_normal).toBe(false)
  })

  it('APCA polarity: black on white = dark-on-light', () => {
    const report = buildContrastReport('fg6', 'bg6', black, white, passAllCvd)
    expect(report.apca.polarity).toBe('dark-on-light')
  })

  it('APCA polarity: white on black = light-on-dark', () => {
    const report = buildContrastReport('fg7', 'bg7', white, black, passAllCvd)
    expect(report.apca.polarity).toBe('light-on-dark')
  })
})
