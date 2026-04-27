import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExportPanel } from '../export/ExportPanel'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useSessionStore } from '@/lib/store/sessionStore'

vi.mock('@/lib/store/paletteStore', () => ({ usePaletteStore: vi.fn() }))
vi.mock('@/lib/store/sessionStore', () => ({ useSessionStore: vi.fn() }))

const SYSTEM = {
  brand: {} as any, neutral: {} as any, success: {} as any,
  warning: {} as any, error: {} as any, info: {} as any,
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
    render(<ExportPanel onExport={vi.fn()} />)
    expect(screen.getByText(/analyze/i)).toBeInTheDocument()
  })

  it('renders free format buttons', () => {
    setupMocks()
    render(<ExportPanel onExport={vi.fn()} />)
    expect(screen.getByRole('button', { name: /css variables/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dtcg/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tailwind/i })).toBeInTheDocument()
  })

  it('pro formats show lock icon for free users', () => {
    setupMocks(false)
    render(<ExportPanel onExport={vi.fn()} />)
    expect(screen.getAllByLabelText(/pro/i).length).toBeGreaterThan(0)
  })

  it('calls onExport with format when clicking free format', () => {
    const onExport = vi.fn()
    setupMocks()
    render(<ExportPanel onExport={onExport} />)
    fireEvent.click(screen.getByRole('button', { name: /css variables/i }))
    expect(onExport).toHaveBeenCalledWith('css')
  })
})
