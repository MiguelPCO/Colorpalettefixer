import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MainCanvas } from '../MainCanvas'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'
import type { Color, GeneratedSystem } from '@/lib/color/types'

vi.mock('@/lib/store/paletteStore', () => ({ usePaletteStore: vi.fn() }))
vi.mock('@/lib/store/uiStore', () => ({ useUIStore: vi.fn() }))

const C: Color = {
  id: 'c1',
  hex: '#3b82f6',
  oklch: { l: 0.6, c: 0.2, h: 264 },
  rgb: { r: 59, g: 130, b: 246 },
  inGamutSrgb: true,
}

const makeSystem = (roles: Record<string, Color> = {}): GeneratedSystem => ({
  brand: {} as any, neutral: {} as any, success: {} as any,
  warning: {} as any, error: {} as any, info: {} as any,
  roles,
})

const mockStores = (
  colors: Color[] = [C],
  isAnalyzing = false,
  generatedSystem: GeneratedSystem | null = null,
) => {
  const setGeneratedSystem = vi.fn()
  vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
    sel({ colors, isAnalyzing, setIsAnalyzing: vi.fn(), generatedSystem, setGeneratedSystem }),
  )
  vi.mocked(useUIStore).mockImplementation((sel: any) =>
    sel({ selectedColorId: null, selectColor: vi.fn() }),
  )
  return { setGeneratedSystem }
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

  it('role select is disabled before analyze', () => {
    mockStores([C], false, null)
    render(<MainCanvas onAnalyze={vi.fn()} />)
    const selects = screen.getAllByRole('combobox')
    expect(selects[0]).toBeDisabled()
  })

  it('role select shows current role when assigned', () => {
    mockStores([C], false, makeSystem({ primary: C }))
    render(<MainCanvas onAnalyze={vi.fn()} />)
    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('primary')
  })

  it('changing role calls setGeneratedSystem with updated roles', () => {
    const system = makeSystem({})
    const { setGeneratedSystem } = mockStores([C], false, system)
    render(<MainCanvas onAnalyze={vi.fn()} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'primary' } })
    expect(setGeneratedSystem).toHaveBeenCalledWith(
      expect.objectContaining({
        roles: expect.objectContaining({ primary: C }),
      }),
    )
  })

  it('changing role unassigns color from its previous role', () => {
    const system = makeSystem({ secondary: C })
    const { setGeneratedSystem } = mockStores([C], false, system)
    render(<MainCanvas onAnalyze={vi.fn()} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'primary' } })
    const call = setGeneratedSystem.mock.calls[0]![0]
    expect(call.roles.primary).toEqual(C)
    expect(call.roles.secondary).toBeUndefined()
  })
})
