import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PreviewTab } from '../preview/PreviewTab'
import { usePaletteStore } from '@/lib/store/paletteStore'

vi.mock('@/lib/store/paletteStore', () => ({ usePaletteStore: vi.fn() }))

const SYSTEM = {
  brand: { light: [], dark: [] },
  neutral: { light: [], dark: [] },
  success: { light: [], dark: [] },
  warning: { light: [], dark: [] },
  error: { light: [], dark: [] },
  info: { light: [], dark: [] },
  roles: {
    primary:    { id: 'p', hex: '#3b82f6', oklch: { l: 0.6, c: 0.2, h: 264 }, rgb: { r: 59, g: 130, b: 246 }, inGamutSrgb: true },
    background: { id: 'bg', hex: '#ffffff', oklch: { l: 1, c: 0, h: 0 }, rgb: { r: 255, g: 255, b: 255 }, inGamutSrgb: true },
    success:    { id: 's', hex: '#22c55e', oklch: { l: 0.7, c: 0.2, h: 145 }, rgb: { r: 34, g: 197, b: 94 }, inGamutSrgb: true },
    warning:    { id: 'w', hex: '#eab308', oklch: { l: 0.8, c: 0.18, h: 85 }, rgb: { r: 234, g: 179, b: 8 }, inGamutSrgb: true },
    error:      { id: 'e', hex: '#ef4444', oklch: { l: 0.55, c: 0.22, h: 27 }, rgb: { r: 239, g: 68, b: 68 }, inGamutSrgb: true },
  },
}

describe('PreviewTab', () => {
  it('shows empty state when no system', () => {
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: null }),
    )
    render(<PreviewTab />)
    expect(screen.getByText(/analyze/i)).toBeInTheDocument()
  })

  it('renders landing scene by default', () => {
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: SYSTEM }),
    )
    render(<PreviewTab />)
    expect(screen.getByTestId('landing-scene')).toBeInTheDocument()
  })

  it('switches to dashboard scene on tab click', () => {
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: SYSTEM }),
    )
    render(<PreviewTab />)
    fireEvent.click(screen.getByRole('button', { name: /dashboard/i }))
    expect(screen.getByTestId('dashboard-scene')).toBeInTheDocument()
  })

  it('switches to mobile scene on tab click', () => {
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: SYSTEM }),
    )
    render(<PreviewTab />)
    fireEvent.click(screen.getByRole('button', { name: /mobile/i }))
    expect(screen.getByTestId('mobile-scene')).toBeInTheDocument()
  })

  it('switches to components scene on tab click', () => {
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: SYSTEM }),
    )
    render(<PreviewTab />)
    fireEvent.click(screen.getByRole('button', { name: /components/i }))
    expect(screen.getByTestId('system-preview')).toBeInTheDocument()
  })

  it('light/dark toggle is always visible', () => {
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: SYSTEM }),
    )
    render(<PreviewTab />)
    expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument()
  })
})
