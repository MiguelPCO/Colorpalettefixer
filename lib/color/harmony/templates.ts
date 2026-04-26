export type HarmonyTemplate = 'mono' | 'analogous' | 'complementary' | 'split-complementary' | 'triadic' | 'tetradic-square' | 'tetradic-rect'

// Angle offsets from base hue for each template
export const HARMONY_TEMPLATES: Record<HarmonyTemplate, number[]> = {
  'mono':               [0],
  'analogous':          [0, 30, -30],
  'complementary':      [0, 180],
  'split-complementary': [0, 150, 210],
  'triadic':            [0, 120, 240],
  'tetradic-square':    [0, 90, 180, 270],
  'tetradic-rect':      [0, 60, 180, 240],
}

export const HARMONY_THRESHOLD_HIGH = 10   // degrees
export const HARMONY_THRESHOLD_MEDIUM = 20 // degrees
