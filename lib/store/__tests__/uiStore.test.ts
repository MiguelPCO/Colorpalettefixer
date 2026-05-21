import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useUIStore } from '../uiStore'

beforeEach(() => useUIStore.getState().reset())

describe('useUIStore', () => {
  it('default activeTab is findings', () => {
    const { result } = renderHook(() => useUIStore((s) => s.activeTab))
    expect(result.current).toBe('findings')
  })

  it('setActiveTab updates tab', () => {
    act(() => useUIStore.getState().setActiveTab('roles'))
    const { result } = renderHook(() => useUIStore((s) => s.activeTab))
    expect(result.current).toBe('roles')
  })

  it('selectColor sets id', () => {
    act(() => useUIStore.getState().selectColor('c1'))
    const { result } = renderHook(() => useUIStore((s) => s.selectedColorId))
    expect(result.current).toBe('c1')
  })

  it('setFindingsFilter updates filter', () => {
    act(() => useUIStore.getState().setFindingsFilter('critical'))
    const { result } = renderHook(() => useUIStore((s) => s.findingsFilter))
    expect(result.current).toBe('critical')
  })

  it('default inspectorWidth is 380', () => {
    const { result } = renderHook(() => useUIStore((s) => s.inspectorWidth))
    expect(result.current).toBe(380)
  })

  it('setInspectorWidth updates state', () => {
    act(() => useUIStore.getState().setInspectorWidth(450))
    const { result } = renderHook(() => useUIStore((s) => s.inspectorWidth))
    expect(result.current).toBe(450)
  })

  it('setInspectorWidth persists to localStorage', () => {
    act(() => useUIStore.getState().setInspectorWidth(500))
    expect(localStorage.getItem('cpf-inspector-width')).toBe('500')
  })

  it('reset preserves inspectorWidth', () => {
    act(() => useUIStore.getState().setInspectorWidth(450))
    act(() => useUIStore.getState().reset())
    const { result } = renderHook(() => useUIStore((s) => s.inspectorWidth))
    expect(result.current).toBe(450)
  })
})
