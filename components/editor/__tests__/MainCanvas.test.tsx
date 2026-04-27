import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MainCanvas } from '../MainCanvas'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'
import type { Color } from '@/lib/color/types'

vi.mock('@/lib/store/paletteStore', () => ({ usePaletteStore: vi.fn() }))
vi.mock('@/lib/store/uiStore', () => ({ useUIStore: vi.fn() }))

const C: Color = {
  id: 'c1',
  hex: '#3b82f6',
  oklch: { l: 0.6, c: 0.2, h: 264 },
  rgb: { r: 59, g: 130, b: 246 },
  inGamutSrgb: true,
}

const mockStores = (colors: Color[] = [C], isAnalyzing = false) => {
  vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
    sel({ colors, isAnalyzing, setIsAnalyzing: vi.fn() }),
  )
  vi.mocked(useUIStore).mockImplementation((sel: any) =>
    sel({ selectedColorId: null, selectColor: vi.fn() }),
  )
}

describe('MainCanvas', () => {
  it('renders color cards for each palette color', () => {
    mockStores()
    render(<MainCanvas onAnalyze={vi.fn()} />)
    expect(screen.getByText('#3b82f6')).toBeInTheDocument()
  })

  it('analyze button calls onAnalyze', () => {
    const onAnalyze = vi.fn()
    const colors: Color[] = [
      C,
      { ...C, id: 'c2', hex: '#ef4444', oklch: { l: 0.5, c: 0.25, h: 25 }, rgb: { r: 239, g: 68, b: 68 } },
    ]
    mockStores(colors)
    render(<MainCanvas onAnalyze={onAnalyze} />)
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }))
    expect(onAnalyze).toHaveBeenCalled()
  })

  it('shows spinner while analyzing', () => {
    mockStores([C], true)
    render(<MainCanvas onAnalyze={vi.fn()} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
