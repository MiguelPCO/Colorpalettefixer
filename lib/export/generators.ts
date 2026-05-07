import { oklchToCss } from '@/lib/color/oklch/format'
import type { GeneratedSystem, OKLCH } from '@/lib/color/types'

function rampVars(name: string, steps: OKLCH[]): string {
  return steps
    .map((step, i) => `  --color-${name}-${i + 1}: ${oklchToCss(step)};`)
    .join('\n')
}

function roleVars(system: GeneratedSystem): string {
  const roles = system.roles ?? {}
  return Object.entries(roles)
    .filter(([, color]) => color !== null)
    .map(([role, color]) => `  --color-${role}: ${oklchToCss(color!.oklch)};`)
    .join('\n')
}

export function generateCss(system: GeneratedSystem): string {
  const lines: string[] = [
    '/* ColorFixer — CSS Custom Properties */',
    ':root {',
    '  /* Roles */',
    roleVars(system),
    '',
    '  /* Brand ramp */',
    rampVars('brand', system.brand.light),
    '',
    '  /* Neutral ramp */',
    rampVars('neutral', system.neutral.light),
    '}',
  ]
  return lines.join('\n')
}

export function generateTailwind(system: GeneratedSystem): string {
  const lines: string[] = [
    '/* ColorFixer — Tailwind v4 @theme */',
    '@theme {',
    '  /* Roles */',
    roleVars(system),
    '',
    '  /* Brand ramp */',
    rampVars('brand', system.brand.light),
    '',
    '  /* Neutral ramp */',
    rampVars('neutral', system.neutral.light),
    '}',
  ]
  return lines.join('\n')
}

export function generateDtcg(system: GeneratedSystem): string {
  const roles = system.roles ?? {}
  const tokens: Record<string, { $type: string; $value: string }> = {}
  for (const [role, color] of Object.entries(roles)) {
    if (color) {
      tokens[role] = { $type: 'color', $value: color.hex }
    }
  }
  return JSON.stringify({ color: tokens }, null, 2)
}

export function downloadText(content: string, filename: string, mime = 'text/plain'): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
