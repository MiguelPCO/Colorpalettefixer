export type ColorId = string // nanoid(8)

export interface OKLCH {
  l: number // [0, 1]
  c: number // [0, ~0.4]
  h: number // [0, 360)
}

export interface RGB {
  r: number // [0, 255]
  g: number // [0, 255]
  b: number // [0, 255]
}

export interface Color {
  id: ColorId
  oklch: OKLCH
  hex: string
  rgb: RGB
  inGamutSrgb: boolean
  p3?: {r: number; g: number; b: number}
  alpha?: number // default 1
  name?: string
  locked?: boolean
}

export type Role =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'neutral'
  | 'background'
  | 'surface'
  | 'text'
  | 'border'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'disabled'
  | 'focus'

export type FindingSeverity = 'critical' | 'warning' | 'info'

export type FindingType =
  | 'redundant'
  | 'very-similar'
  | 'outlier'
  | 'no-neutral'
  | 'no-accent'
  | 'no-hierarchy'
  | 'double-accent'
  | 'ramp-gap'
  | 'temperature-imbalance'
  | 'contrast-failure'

export interface FixSuggestion {
  targetColorId: ColorId
  newOklch: OKLCH
  delta: {dL: number; dC: number; dH: number}
  explanation: string
  preservedAxis: 'hue' | 'chroma' | 'lightness' | 'none'
  highDelta: boolean // true if |dH| > 5° or |dC| > 0.10
}

export interface Finding {
  id: string
  type: FindingType
  severity: FindingSeverity
  affectedColorIds: ColorId[]
  rule: string // e.g. "WCAG 2.2 SC 1.4.3"
  ruleLabel: 'rule' | 'heuristic' | 'inference' | 'validation'
  explanation: string
  suggestion?: FixSuggestion
  dismissedAt?: Date
}

export interface ContrastReport {
  fg: ColorId
  bg: ColorId
  wcag: {
    ratio: number
    AA_normal: boolean
    AA_large: boolean
    AAA_normal: boolean
    AAA_large: boolean
    nonText: boolean
  }
  apca: {
    lc: number
    polarity: 'light-on-dark' | 'dark-on-light'
    meetsLc75: boolean
    meetsLc60: boolean
    meetsLc45: boolean
  }
  cvd: {
    deutan: {pass: boolean; deltaE: number}
    protan: {pass: boolean; deltaE: number}
    tritan: {pass: boolean; deltaE: number}
    achromatopsia: {pass: boolean; deltaE: number}
  }
  classification:
    | 'pass-AAA'
    | 'pass-AA'
    | 'pass-AA-large'
    | 'warn'
    | 'fail'
    | 'fail-CVD'
}

export interface HarmonyDetection {
  template:
    | 'mono'
    | 'analogous'
    | 'complementary'
    | 'split-complementary'
    | 'triadic'
    | 'tetradic-square'
    | 'tetradic-rect'
  baseHue: number
  error: number // degrees
  confidence: 'high' | 'medium' | 'low' | 'none'
}

export interface GeneratedRamp {
  light: OKLCH[] // 12 steps
  dark: OKLCH[] // 12 steps
}

export interface GeneratedSystem {
  brand: GeneratedRamp
  accent?: GeneratedRamp
  neutral: GeneratedRamp
  success: GeneratedRamp
  warning: GeneratedRamp
  error: GeneratedRamp
  info: GeneratedRamp
  roles?: Partial<Record<Role, Color | null>>
  contrastMatrix?: Record<string, ContrastMatrixEntry>
}

export interface ContrastMatrixEntry {
  wcag: number
  apca: number
  wcagLevel: 'AAA' | 'AA' | 'AA_LARGE' | 'FAIL'
  apcaPolarity: 'light-on-dark' | 'dark-on-light'
}
