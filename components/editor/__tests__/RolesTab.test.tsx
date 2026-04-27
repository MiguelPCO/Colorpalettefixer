import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RolesTab } from '../roles/RolesTab'
import { usePaletteStore } from '@/lib/store/paletteStore'

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div>{children}</div>,
  useDraggable: () => ({ setNodeRef: vi.fn(), listeners: {}, attributes: {}, isDragging: false }),
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
}))
vi.mock('@/lib/store/paletteStore', () => ({ usePaletteStore: vi.fn() }))

// Use actual Role values
const SYSTEM = {
  brand: {} as any,
  neutral: {} as any,
  success: {} as any,
  warning: {} as any,
  error: {} as any,
  info: {} as any,
  roles: {
    primary: { id: 'c1', hex: '#3b82f6', oklch: { l: 0.6, c: 0.2, h: 264 }, rgb: { r: 59, g: 130, b: 246 }, inGamutSrgb: true },
    background: null,
  },
}

describe('RolesTab', () => {
  it('renders role slots', () => {
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: SYSTEM, colors: [] }),
    )
    render(<RolesTab />)
    expect(screen.getByText(/primary/i)).toBeInTheDocument()
    expect(screen.getByText(/background/i)).toBeInTheDocument()
  })

  it('shows assigned color hex in slot', () => {
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: SYSTEM, colors: [] }),
    )
    render(<RolesTab />)
    expect(screen.getByText('#3b82f6')).toBeInTheDocument()
  })

  it('shows empty state when no system', () => {
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ generatedSystem: null, colors: [] }),
    )
    render(<RolesTab />)
    expect(screen.getByText(/analyze/i)).toBeInTheDocument()
  })
})
