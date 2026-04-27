import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useEditorShortcuts } from '../useEditorShortcuts'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'

vi.mock('@/lib/store/paletteStore', () => ({ usePaletteStore: vi.fn() }))
vi.mock('@/lib/store/uiStore', () => ({ useUIStore: vi.fn() }))

describe('useEditorShortcuts', () => {
  const undo = vi.fn()
  const redo = vi.fn()
  const togglePanel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Attach temporal directly onto the mocked store function
    ;(usePaletteStore as any).temporal = { getState: () => ({ undo, redo }) }
    vi.mocked(useUIStore).mockImplementation((sel: any) =>
      sel({ togglePanel }),
    )
  })

  const fireKey = (key: string, metaKey = false, shiftKey = false) => {
    const event = new KeyboardEvent('keydown', { key, metaKey, ctrlKey: metaKey, shiftKey, bubbles: true })
    document.dispatchEvent(event)
  }

  it('Cmd+Z calls undo', () => {
    renderHook(() => useEditorShortcuts())
    fireKey('z', true, false)
    expect(undo).toHaveBeenCalled()
  })

  it('Cmd+Shift+Z calls redo', () => {
    renderHook(() => useEditorShortcuts())
    fireKey('z', true, true)
    expect(redo).toHaveBeenCalled()
  })

  it('Cmd+\\ toggles panel', () => {
    renderHook(() => useEditorShortcuts())
    fireKey('\\', true, false)
    expect(togglePanel).toHaveBeenCalled()
  })
})
