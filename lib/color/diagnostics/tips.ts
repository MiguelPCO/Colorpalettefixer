import type { FindingType } from '../types'

export interface FindingTip {
  tip: string
  wcagUrl: string
}

export const FINDING_TIPS: Record<FindingType, FindingTip> = {
  'contrast-failure': {
    tip: 'Lower L in OKLCH for the text color (target L < 0.55 on white backgrounds) or increase the background L. Re-check the ratio on each iteration to verify it meets the target.',
    wcagUrl: 'https://www.w3.org/TR/WCAG22/#contrast-minimum',
  },
  'redundant': {
    tip: 'Merge the duplicate roles into one color, or differentiate them by shifting L by ≥ 0.05 or H by ≥ 15° so each color serves a distinct visual purpose.',
    wcagUrl: 'https://www.w3.org/TR/WCAG22/#use-of-color',
  },
  'very-similar': {
    tip: 'Increase the lightness gap (dL) or hue gap (dH) between these two colors. A ΔEok ≥ 0.04 ensures they read as visibly distinct in all contexts.',
    wcagUrl: 'https://www.w3.org/TR/WCAG22/#use-of-color',
  },
  'outlier': {
    tip: "Shift the outlier hue toward the palette's dominant hue range. A hue offset > 60° from the cluster center breaks harmonic unity; aim for < 40°.",
    wcagUrl: 'https://www.w3.org/TR/WCAG22/',
  },
  'no-neutral': {
    tip: 'Add a low-chroma color (C < 0.02 in OKLCH) for secondary text and UI chrome. Target L ≈ 0.55–0.65 in light mode, L ≈ 0.40–0.50 in dark mode.',
    wcagUrl: 'https://www.w3.org/TR/WCAG22/',
  },
  'no-accent': {
    tip: 'Add a complementary or split-complementary hue (offset 150–210° from primary) for interactive hover and focus states so they read as distinct from the primary action.',
    wcagUrl: 'https://www.w3.org/TR/WCAG22/',
  },
  'no-hierarchy': {
    tip: 'Ensure at least 3 distinct lightness levels in the palette — for example L ≈ 0.15 (text), L ≈ 0.55 (mid), L ≈ 0.95 (background) — to support clear visual hierarchy.',
    wcagUrl: 'https://www.w3.org/TR/WCAG22/',
  },
  'double-accent': {
    tip: 'Keep a single accent role. Demote extra accent colors to secondary or neutral roles to avoid competing focal points that dilute the interactive signal.',
    wcagUrl: 'https://www.w3.org/TR/WCAG22/',
  },
  'ramp-gap': {
    tip: 'Fill the missing lightness step by interpolating OKLCH between the adjacent steps. Aim for evenly spaced L values across the ramp (e.g. steps of 0.07–0.09 L each).',
    wcagUrl: 'https://www.w3.org/TR/WCAG22/',
  },
  'temperature-imbalance': {
    tip: 'Balance warm (H 0–60°, 300–360°) and cool (H 150–270°) hues. Shift an outlier hue 20–30° toward the underrepresented temperature to restore visual equilibrium.',
    wcagUrl: 'https://www.w3.org/TR/WCAG22/',
  },
}
