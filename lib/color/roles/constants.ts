import type { Role } from '../types'

export const ALL_ROLES: Role[] = [
  'primary', 'secondary', 'accent', 'neutral',
  'background', 'surface', 'border', 'text',
  'success', 'warning', 'error', 'info',
  'disabled', 'focus',
]

export const MATRIX_FG_ROLES: Role[] = [
  'text', 'primary', 'secondary', 'accent',
  'neutral', 'error', 'warning', 'success', 'info',
  'disabled', 'focus', 'border',
]

export const MATRIX_BG_ROLES: Role[] = [
  'background', 'surface', 'primary', 'secondary', 'accent',
]
