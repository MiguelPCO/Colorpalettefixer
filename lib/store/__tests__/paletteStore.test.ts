import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { usePaletteStore } from '../paletteStore'
import type { Color } from '@/lib/color/types'

const RED: Color = {
  id: 'c1',
  hex: '#ff0000',
  oklch: { l: 0.5276, c: 0.2774, h: 29.23 },
  rgb: { r: 255, g: 0, b: 0 },
  inGamutSrgb: true,
}

beforeEach(() => {
  usePaletteStore.getState().reset()
  usePaletteStore.temporal.getState().clear()
})

describe('paletteStore', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => usePaletteStore((s) => s.colors))
    expect(result.current).toHaveLength(0)
  })

  it('addColor appends color', () => {
    act(() => usePaletteStore.getState().addColor(RED))
    const { result } = renderHook(() => usePaletteStore((s) => s.colors))
    expect(result.current).toHaveLength(1)
    expect(result.current[0]!.hex).toBe('#ff0000')
  })

  it('removeColor removes by id', () => {
    act(() => {
      usePaletteStore.getState().addColor(RED)
      usePaletteStore.getState().removeColor('c1')
    })
    const { result } = renderHook(() => usePaletteStore((s) => s.colors))
    expect(result.current).toHaveLength(0)
  })

  it('undo restores previous state', () => {
    act(() => usePaletteStore.getState().addColor(RED))
    act(() => usePaletteStore.temporal.getState().undo())
    const { result } = renderHook(() => usePaletteStore((s) => s.colors))
    expect(result.current).toHaveLength(0)
  })

  it('redo reapplies action', () => {
    act(() => usePaletteStore.getState().addColor(RED))
    act(() => usePaletteStore.temporal.getState().undo())
    act(() => usePaletteStore.temporal.getState().redo())
    const { result } = renderHook(() => usePaletteStore((s) => s.colors))
    expect(result.current).toHaveLength(1)
  })

  it('ignoreFinding removes finding by id', () => {
    act(() =>
      usePaletteStore.getState().setFindings([
        {
          id: 'f1',
          type: 'redundant',
          rule: 'redundancy',
          ruleLabel: 'heuristic',
          severity: 'warning',
          affectedColorIds: ['c1'],
          explanation: 'too similar',
        },
      ]),
    )
    act(() => usePaletteStore.getState().ignoreFinding('f1'))
    const { result } = renderHook(() => usePaletteStore((s) => s.findings))
    expect(result.current).toHaveLength(0)
  })
})
