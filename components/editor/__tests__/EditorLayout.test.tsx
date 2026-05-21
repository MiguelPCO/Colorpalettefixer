import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EditorLayout } from '../EditorLayout'
import { useUIStore } from '@/lib/store/uiStore'

vi.mock('@/lib/store/uiStore', () => ({ useUIStore: vi.fn() }))

describe('EditorLayout', () => {
  const mockSetInspectorWidth = vi.fn()

  beforeEach(() => {
    mockSetInspectorWidth.mockClear()
    vi.mocked(useUIStore).mockImplementation((sel: any) =>
      sel({ inspectorWidth: 380, setInspectorWidth: mockSetInspectorWidth }),
    )
  })

  it('renders sidebar, main, and inspector slots', () => {
    render(
      <EditorLayout
        sidebar={<div data-testid="sidebar">sidebar</div>}
        main={<div data-testid="main">main</div>}
        inspector={<div data-testid="inspector">inspector</div>}
      />,
    )
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('main')).toBeInTheDocument()
    expect(screen.getByTestId('inspector')).toBeInTheDocument()
  })

  it('renders drag handle', () => {
    render(<EditorLayout sidebar={<div />} main={<div />} inspector={<div />} />)
    expect(screen.getByTestId('drag-handle')).toBeInTheDocument()
  })

  it('drag right reduces inspector width', () => {
    render(<EditorLayout sidebar={<div />} main={<div />} inspector={<div />} />)
    const handle = screen.getByTestId('drag-handle')
    fireEvent.mouseDown(handle, { clientX: 400 })
    fireEvent.mouseMove(document, { clientX: 450 })
    fireEvent.mouseUp(document)
    expect(mockSetInspectorWidth).toHaveBeenCalledWith(330)
  })

  it('drag left increases inspector width', () => {
    render(<EditorLayout sidebar={<div />} main={<div />} inspector={<div />} />)
    const handle = screen.getByTestId('drag-handle')
    fireEvent.mouseDown(handle, { clientX: 400 })
    fireEvent.mouseMove(document, { clientX: 350 })
    fireEvent.mouseUp(document)
    expect(mockSetInspectorWidth).toHaveBeenCalledWith(430)
  })

  it('clamps to minimum 280', () => {
    render(<EditorLayout sidebar={<div />} main={<div />} inspector={<div />} />)
    fireEvent.mouseDown(screen.getByTestId('drag-handle'), { clientX: 400 })
    fireEvent.mouseMove(document, { clientX: 700 })
    expect(mockSetInspectorWidth).toHaveBeenCalledWith(280)
  })

  it('clamps to maximum 560', () => {
    render(<EditorLayout sidebar={<div />} main={<div />} inspector={<div />} />)
    fireEvent.mouseDown(screen.getByTestId('drag-handle'), { clientX: 400 })
    fireEvent.mouseMove(document, { clientX: 50 })
    expect(mockSetInspectorWidth).toHaveBeenCalledWith(560)
  })

  it('stops updating after mouseup', () => {
    render(<EditorLayout sidebar={<div />} main={<div />} inspector={<div />} />)
    fireEvent.mouseDown(screen.getByTestId('drag-handle'), { clientX: 400 })
    fireEvent.mouseUp(document)
    mockSetInspectorWidth.mockClear()
    fireEvent.mouseMove(document, { clientX: 300 })
    expect(mockSetInspectorWidth).not.toHaveBeenCalled()
  })
})
