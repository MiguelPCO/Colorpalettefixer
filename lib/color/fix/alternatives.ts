import { fixByLAdjust, fixByHAdjust, fixByChadjust } from './minDelta'
import type { OKLCH, FixSuggestion, ColorId } from '../types'

export function fixAlternatives(
  color: OKLCH,
  background: OKLCH,
  targetColorId: ColorId,
): FixSuggestion[] {
  const results: (FixSuggestion | null)[] = [
    fixByLAdjust(color, background, targetColorId),
    fixByHAdjust(color, background, targetColorId),
    fixByChadjust(color, background, targetColorId),
  ]
  return results.filter((r): r is FixSuggestion => r !== null)
}
