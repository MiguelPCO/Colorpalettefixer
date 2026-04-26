import { fitness } from './fitness'
import { generateSynthetic } from './synthetic'
import type { Color, ColorId, Role, OKLCH } from '../types'

const CRITICAL_ROLES: Role[] = ['primary', 'neutral', 'background', 'text']
const SEMANTIC_ROLES: Role[] = ['success', 'warning', 'error', 'info']
const ALL_ROLES: Role[] = [...CRITICAL_ROLES, 'secondary', 'accent', 'surface', 'border', ...SEMANTIC_ROLES]

const FITNESS_THRESHOLD = 0.05

export interface RoleAssignments {
  [role: string]: ColorId | null
}

export interface SyntheticColor {
  role: Role
  oklch: OKLCH
}

export function assignRoles(colors: Color[]): {
  assignments: RoleAssignments
  synthetics: SyntheticColor[]
} {
  const assignments: RoleAssignments = {}
  const usedColors = new Set<ColorId>()
  const assignedRoles = new Set<Role>()

  // Initialize assignments with null
  for (const role of ALL_ROLES) {
    assignments[role] = null
  }

  // 1. Create all possible (role, color) pairs with their fitness scores
  const pairs: Array<{ role: Role; id: ColorId; score: number }> = []
  for (const role of ALL_ROLES) {
    for (const color of colors) {
      const score = fitness(color.oklch, role)
      if (score >= FITNESS_THRESHOLD) {
        pairs.push({ role, id: color.id, score })
      }
    }
  }

  // 2. Sort pairs by score descending
  pairs.sort((a, b) => b.score - a.score)

  // 3. Assign greedily (allow reuse of colors for different roles)
  for (const pair of pairs) {
    if (!assignedRoles.has(pair.role)) {
      assignments[pair.role] = pair.id
      assignedRoles.add(pair.role)
      usedColors.add(pair.id)
    }
  }

  // 4. Generate synthetics for missing semantic roles
  const primaryId = assignments['primary']
  const primaryColor = colors.find(c => c.id === primaryId)
  const primaryOklch = primaryColor?.oklch ?? { l: 0.5, c: 0.15, h: 258 }

  const syntheticsList: SyntheticColor[] = []
  for (const role of SEMANTIC_ROLES) {
    if (!assignments[role]) {
      syntheticsList.push({ role, oklch: generateSynthetic(role, primaryOklch) })
    }
  }

  return { assignments, synthetics: syntheticsList }
}
