import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExportPanel } from '../export/ExportPanel'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useSessionStore } from '@/lib/store/sessionStore'

vi.mock('@/lib/store/paletteStore', () => ({ usePaletteStore: vi.fn() }))
vi.mock('@/lib/store/sessionStore', () => ({ useSessionStore: vi.fn() }))
vi.mock('@/lib/export/generators', () => ({
  generateCss: vi.fn(() => ':root {}'),
  generateTailwind: vi.fn(() => '@theme {}'),
  generateDtcg: vi.fn(() => '{}'),
  downloadText: vi.fn(),
}))

const SYSTEM = {
  brand: { light: [], dark: [] },
  neutral: { light: [], dark: [] },
  success: { light: [], dark: [] },
  warning: { light: [], dark: [] },
  error: { light: [], dark: [] },
  info: { light: [], dark: [] },
  roles: {},
}

const setupMocks = (isPro = false, hasSystem = true) => {
  vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
    sel({ generatedSystem: hasSystem ? SYSTEM : null }),
  )
  vi.mocked(useSessionStore).mockImplementation((sel: any) =>
    sel({ isPro }),
  )
}

describe('ExportPanel', () => {
  it('shows empty state when no system', () => {
    setupMocks(false, false)
    render(<ExportPanel />)
    expect(screen.getByText(/analyze/i)).toBeInTheDocument()
  })

  it('renders free format buttons', () => {
    setupMocks()
    render(<ExportPanel />)
    expect(screen.getByRole('button', { name: /css variables/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dtcg/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tailwind/i })).toBeInTheDocument()
  })

  it('pro formats show lock icon for free users', () => {
    setupMocks(false)
    render(<ExportPanel />)
    expect(screen.getAllByLabelText(/pro/i).length).toBeGreaterThan(0)
  })

  it('clicking free format triggers download', async () => {
    const { downloadText } = await import('@/lib/export/generators')
    setupMocks()
    render(<ExportPanel />)
    fireEvent.click(screen.getByRole('button', { name: /css variables/i }))
    expect(downloadText).toHaveBeenCalled()
  })
})
