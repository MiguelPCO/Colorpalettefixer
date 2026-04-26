import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePaletteStore } from '../paletteStore'
import type { Color } from '@/lib/color/types'

vi.mock('idb-keyval', () => ({
  get: vi.fn().mockResolvedValue(undefined),
  set: vi.fn().mockResolvedValue(undefined),
}))

const RED: Color = {
  id: 'c1',
  hex: '#ff0000',
  oklch: { l: 0.53, c: 0.28, h: 29 },
  rgb: { r: 255, g: 0, b: 0 },
  inGamutSrgb: true,
}

beforeEach(() => {
  usePaletteStore.getState().reset()
  vi.clearAllMocks()
})

describe('useAutosave', () => {
  it('restores saved colors on mount', async () => {
    const { get } = await import('idb-keyval')
    vi.mocked(get).mockResolvedValueOnce([RED])
    const { useAutosave } = await import('../autosave')
    renderHook(() => useAutosave())
    await waitFor(() =>
      expect(usePaletteStore.getState().colors).toHaveLength(1),
    )
  })

  it('saves colors to idb on change', async () => {
    const { set } = await import('idb-keyval')
    const { useAutosave } = await import('../autosave')
    renderHook(() => useAutosave())
    act(() => usePaletteStore.getState().addColor(RED))
    await waitFor(() =>
      expect(vi.mocked(set)).toHaveBeenCalledWith(
        'cpf-palette-v1',
        expect.arrayContaining([expect.objectContaining({ id: 'c1' })]),
      ),
    )
  })
})
