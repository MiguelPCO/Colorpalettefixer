import { describe, it } from 'vitest'
import { render } from '@testing-library/react'
import { DashboardScene } from '../DashboardScene'
import type { GeneratedSystem } from '@/lib/color/types'

const EMPTY_SYSTEM: GeneratedSystem = {
  brand: { light: [], dark: [] },
  neutral: { light: [], dark: [] },
  success: { light: [], dark: [] },
  warning: { light: [], dark: [] },
  error: { light: [], dark: [] },
  info: { light: [], dark: [] },
}

describe('DashboardScene', () => {
  it('renders without crash with empty roles', () => {
    render(<DashboardScene system={EMPTY_SYSTEM} previewMode="light" />)
  })

  it('renders without crash in dark mode', () => {
    render(<DashboardScene system={EMPTY_SYSTEM} previewMode="dark" />)
  })
})
