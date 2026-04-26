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
})
