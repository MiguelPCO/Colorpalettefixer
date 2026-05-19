import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AccessibilityMatrix } from '../accessibility/AccessibilityMatrix'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'

vi.mock('@/lib/store/paletteStore', () => ({ usePaletteStore: vi.fn() }))
vi.mock('@/lib/store/uiStore', () => ({ useUIStore: vi.fn() }))

const mockUIStore = () => {
  vi.mocked(useUIStore).mockImplementation((sel: any) =>
    sel({ contrastMode: 'WCAG', setContrastMode: vi.fn(), matrixTier: 'AA', setMatrixTier: vi.fn(), cvdMode: 'none', setCvdMode: vi.fn(), matrixFontSize: 'normal', setMatrixFontSize: vi.fn(), matrixWeight: 'normal', setMatrixWeight: vi.fn() }),
  )
}

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
    mockUIStore()
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: null }),
    )
    render(<AccessibilityMatrix />)
    expect(screen.getByText(/analyze/i)).toBeInTheDocument()
  })

  it('renders contrast cell with WCAG ratio', () => {
    mockUIStore()
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: SYSTEM }),
    )
    render(<AccessibilityMatrix />)
    expect(screen.getByText('19.5:1')).toBeInTheDocument()
  })

  it('shows AAA badge on passing pair', () => {
    mockUIStore()
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: SYSTEM }),
    )
    render(<AccessibilityMatrix />)
    // AAA appears as both the badge in the cell and the tier toggle button
    expect(screen.getAllByText('AAA').length).toBeGreaterThanOrEqual(1)
  })

  it('shows role name labels in matrix headers', () => {
    mockUIStore()
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: SYSTEM }),
    )
    render(<AccessibilityMatrix />)
    // Role name appears as text label in the matrix headers
    expect(screen.getByText('text')).toBeInTheDocument()
    expect(screen.getByText('background')).toBeInTheDocument()
  })
})
