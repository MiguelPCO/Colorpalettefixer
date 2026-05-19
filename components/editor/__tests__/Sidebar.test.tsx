import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '../Sidebar'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'
import type { Color } from '@/lib/color/types'

vi.mock('@/lib/store/paletteStore', () => ({
  usePaletteStore: vi.fn(),
}))
vi.mock('@/lib/store/uiStore', () => ({
  useUIStore: vi.fn(),
}))

const mockPaletteStore = (colors: Color[] = []) => {
  const addColor = vi.fn()
  const removeColor = vi.fn()
  vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
    sel({ colors, addColor, removeColor }),
  )
  return { addColor, removeColor }
}

const mockUIStore = () => {
  const selectColor = vi.fn()
  vi.mocked(useUIStore).mockImplementation((sel: any) =>
    sel({ selectedColorId: null, selectColor }),
  )
  return { selectColor }
}

describe('Sidebar', () => {
  it('renders empty state when no colors', () => {
    mockPaletteStore([])
    mockUIStore()
    render(<Sidebar />)
    expect(screen.getByText(/no colors yet/i)).toBeInTheDocument()
  })

  it('renders color swatches for each color', () => {
    mockPaletteStore([{
      id: 'c1', hex: '#ff0000',
      oklch: { l: 0.53, c: 0.28, h: 29 },
      rgb: { r: 255, g: 0, b: 0 },
      inGamutSrgb: true,
    }])
    mockUIStore()
    render(<Sidebar />)
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('calls addColor on valid hex submit', async () => {
    const { addColor } = mockPaletteStore([])
    mockUIStore()
    render(<Sidebar />)
    const input = screen.getByPlaceholderText(/#hex/i)
    await userEvent.type(input, '#3b82f6{Enter}')
    expect(addColor).toHaveBeenCalledWith(
      expect.objectContaining({ hex: '#3b82f6' }),
    )
  })

  it('rejects invalid hex', async () => {
    const { addColor } = mockPaletteStore([])
    mockUIStore()
    render(<Sidebar />)
    const input = screen.getByPlaceholderText(/#hex/i)
    await userEvent.type(input, 'notahex{Enter}')
    expect(addColor).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
