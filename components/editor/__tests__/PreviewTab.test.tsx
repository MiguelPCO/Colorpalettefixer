import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PreviewTab } from '../preview/PreviewTab'
import { usePaletteStore } from '@/lib/store/paletteStore'

vi.mock('@/lib/store/paletteStore', () => ({ usePaletteStore: vi.fn() }))

// Use actual Role values
const ROLES = {
  primary: { id: 'p', hex: '#3b82f6', oklch: { l: 0.6, c: 0.2, h: 264 }, rgb: { r: 59, g: 130, b: 246 }, inGamutSrgb: true },
  background: { id: 'b', hex: '#ffffff', oklch: { l: 1, c: 0, h: 0 }, rgb: { r: 255, g: 255, b: 255 }, inGamutSrgb: true },
  text: { id: 't', hex: '#1a1a1a', oklch: { l: 0.15, c: 0.02, h: 280 }, rgb: { r: 26, g: 26, b: 26 }, inGamutSrgb: true },
  success: { id: 's', hex: '#22c55e', oklch: { l: 0.7, c: 0.2, h: 145 }, rgb: { r: 34, g: 197, b: 94 }, inGamutSrgb: true },
  warning: { id: 'w', hex: '#eab308', oklch: { l: 0.8, c: 0.18, h: 85 }, rgb: { r: 234, g: 179, b: 8 }, inGamutSrgb: true },
  error: { id: 'e', hex: '#ef4444', oklch: { l: 0.55, c: 0.22, h: 27 }, rgb: { r: 239, g: 68, b: 68 }, inGamutSrgb: true },
}

describe('PreviewTab', () => {
  it('shows empty state when no system', () => {
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: null }),
    )
    render(<PreviewTab />)
    expect(screen.getByText(/analyze/i)).toBeInTheDocument()
  })

  it('renders button preview section', () => {
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: { roles: ROLES } }),
    )
    render(<PreviewTab />)
    expect(screen.getByText(/buttons/i)).toBeInTheDocument()
  })

  it('renders badge section with semantic states', () => {
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: { roles: ROLES } }),
    )
    render(<PreviewTab />)
    expect(screen.getByText(/badges/i)).toBeInTheDocument()
  })
})
