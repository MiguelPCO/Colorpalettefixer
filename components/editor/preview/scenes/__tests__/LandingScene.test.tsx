import { describe, it } from 'vitest'
import { render } from '@testing-library/react'
import { LandingScene } from '../LandingScene'
import type { GeneratedSystem } from '@/lib/color/types'

const EMPTY_SYSTEM: GeneratedSystem = {
  brand: { light: [], dark: [] },
  neutral: { light: [], dark: [] },
  success: { light: [], dark: [] },
  warning: { light: [], dark: [] },
  error: { light: [], dark: [] },
  info: { light: [], dark: [] },
}

describe('LandingScene', () => {
  it('renders without crash with empty roles', () => {
    render(<LandingScene system={EMPTY_SYSTEM} previewMode="light" />)
  })

  it('renders without crash in dark mode', () => {
    render(<LandingScene system={EMPTY_SYSTEM} previewMode="dark" />)
  })

  it('renders without crash with full roles', () => {
    render(<LandingScene
      system={{
        ...EMPTY_SYSTEM,
        roles: {
          primary: { id: 'p', hex: '#6366f1', oklch: { l: 0.6, c: 0.2, h: 264 }, rgb: { r: 99, g: 102, b: 241 }, inGamutSrgb: true },
          background: { id: 'bg', hex: '#ffffff', oklch: { l: 1, c: 0, h: 0 }, rgb: { r: 255, g: 255, b: 255 }, inGamutSrgb: true },
        },
      }}
      previewMode="light"
    />)
  })
})
