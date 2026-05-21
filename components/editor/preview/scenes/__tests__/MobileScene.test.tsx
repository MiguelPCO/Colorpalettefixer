import { describe, it } from 'vitest'
import { render } from '@testing-library/react'
import { MobileScene } from '../MobileScene'
import type { GeneratedSystem } from '@/lib/color/types'

const EMPTY_SYSTEM: GeneratedSystem = {
  brand: { light: [], dark: [] },
  neutral: { light: [], dark: [] },
  success: { light: [], dark: [] },
  warning: { light: [], dark: [] },
  error: { light: [], dark: [] },
  info: { light: [], dark: [] },
}

describe('MobileScene', () => {
  it('renders without crash with empty roles', () => {
    render(<MobileScene system={EMPTY_SYSTEM} previewMode="light" />)
  })

  it('renders without crash in dark mode', () => {
    render(<MobileScene system={EMPTY_SYSTEM} previewMode="dark" />)
  })
})
