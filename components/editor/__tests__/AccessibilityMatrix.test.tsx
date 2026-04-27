import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AccessibilityMatrix } from '../accessibility/AccessibilityMatrix'
import { usePaletteStore } from '@/lib/store/paletteStore'

vi.mock('@/lib/store/paletteStore', () => ({ usePaletteStore: vi.fn() }))

const TEXT = { id: 'txt', hex: '#1a1a1a', oklch: { l: 0.15, c: 0.02, h: 280 }, rgb: { r: 26, g: 26, b: 26 }, inGamutSrgb: true }
const BG   = { id: 'bg',  hex: '#ffffff', oklch: { l: 1.0,  c: 0,    h: 0   }, rgb: { r: 255, g: 255, b: 255 }, inGamutSrgb: true }

// Using actual Role values: 'text' not 'text-primary', 'background' for bg
const SYSTEM = {
  brand: {} as any, neutral: {} as any, success: {} as any,
  warning: {} as any, error: {} as any, info: {} as any,
  roles: { text: TEXT, background: BG },
  contrastMatrix: {
    'txt:bg': { wcag: 19.5, apca: 108, wcagLevel: 'AAA' as const, apcaPolarity: 'dark-on-light' as const },
  },
}

describe('AccessibilityMatrix', () => {
  it('shows empty state when no system', () => {
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: null }),
    )
    render(<AccessibilityMatrix />)
    expect(screen.getByText(/analyze/i)).toBeInTheDocument()
  })

  it('renders contrast cell with WCAG ratio', () => {
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: SYSTEM }),
    )
    render(<AccessibilityMatrix />)
    expect(screen.getByText('19.5:1')).toBeInTheDocument()
  })

  it('shows AAA badge on passing pair', () => {
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: SYSTEM }),
    )
    render(<AccessibilityMatrix />)
    expect(screen.getByText('AAA')).toBeInTheDocument()
  })
})
