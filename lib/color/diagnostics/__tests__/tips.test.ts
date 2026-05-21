import { describe, it, expect } from 'vitest'
import { FINDING_TIPS } from '../tips'
import type { FindingType } from '@/lib/color/types'

const ALL_TYPES: FindingType[] = [
  'contrast-failure',
  'redundant',
  'very-similar',
  'outlier',
  'no-neutral',
  'no-accent',
  'no-hierarchy',
  'double-accent',
  'ramp-gap',
  'temperature-imbalance',
]

describe('FINDING_TIPS', () => {
  it('covers all 10 FindingTypes', () => {
    for (const type of ALL_TYPES) {
      expect(FINDING_TIPS[type], `missing tip for ${type}`).toBeDefined()
    }
  })

  it('every entry has a non-empty tip string', () => {
    for (const type of ALL_TYPES) {
      expect(typeof FINDING_TIPS[type].tip).toBe('string')
      expect(FINDING_TIPS[type].tip.length).toBeGreaterThan(10)
    }
  })

  it('every entry has a valid wcagUrl', () => {
    for (const type of ALL_TYPES) {
      expect(FINDING_TIPS[type].wcagUrl).toContain('https://www.w3.org/TR/WCAG22')
    }
  })

  it('WCAG findings link to specific anchors', () => {
    expect(FINDING_TIPS['contrast-failure'].wcagUrl).toContain('#')
    expect(FINDING_TIPS['redundant'].wcagUrl).toContain('#')
    expect(FINDING_TIPS['very-similar'].wcagUrl).toContain('#')
  })
})
