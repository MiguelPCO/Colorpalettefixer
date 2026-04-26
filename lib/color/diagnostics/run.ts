import {
  checkRedundancy, checkNeutral, checkAccent, checkHierarchy,
  checkDoubleAccent, checkContrastFailure, checkTemperatureImbalance,
  checkRampGap, checkOutlier
} from './rules'
import type { Color, Finding } from '../types'

// Full diagnostic pipeline: run all rules
export function runDiagnostics(colors: Color[]): Finding[] {
  if (colors.length === 0) return []

  const findings: Finding[] = [
    ...checkRedundancy(colors),
    ...checkNeutral(colors),
    ...checkAccent(colors),
    ...checkHierarchy(colors),
    ...checkDoubleAccent(colors),
    ...checkContrastFailure(colors),
    ...checkTemperatureImbalance(colors),
    ...checkRampGap(colors),
    ...checkOutlier(colors),
  ]

  // Sort: critical first, then warning, then info
  const order = { critical: 0, warning: 1, info: 2 }
  return findings.sort((a, b) => order[a.severity] - order[b.severity])
}
