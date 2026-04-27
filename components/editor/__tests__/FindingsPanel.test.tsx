import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FindingsPanel } from '../findings/FindingsPanel'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'
import type { Finding } from '@/lib/color/types'

vi.mock('@/lib/store/paletteStore', () => ({ usePaletteStore: vi.fn() }))
vi.mock('@/lib/store/uiStore', () => ({ useUIStore: vi.fn() }))

// Use actual Finding type fields
const FINDING: Finding = {
  id: 'f1',
  type: 'very-similar',
  rule: 'redundancy',
  ruleLabel: 'heuristic',
  severity: 'warning',
  affectedColorIds: ['c1', 'c2'],
  explanation: 'Colors c1 and c2 are too similar (ΔEok 0.009)',
}

describe('FindingsPanel', () => {
  const setupMocks = (findings: Finding[], filter = 'all') => {
    const ignoreFinding = vi.fn()
    vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
      sel({ findings, ignoreFinding }),
    )
    vi.mocked(useUIStore).mockImplementation((sel: any) =>
      sel({ findingsFilter: filter, setFindingsFilter: vi.fn() }),
    )
    return { ignoreFinding }
  }

  it('shows empty state when no findings', () => {
    setupMocks([])
    render(<FindingsPanel />)
    expect(screen.getByText(/no issues found/i)).toBeInTheDocument()
  })

  it('renders finding card', () => {
    setupMocks([FINDING])
    render(<FindingsPanel />)
    expect(screen.getByText(/Colors c1 and c2/i)).toBeInTheDocument()
  })

  it('ignore button calls ignoreFinding', () => {
    const { ignoreFinding } = setupMocks([FINDING])
    render(<FindingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /ignore/i }))
    expect(ignoreFinding).toHaveBeenCalledWith('f1')
  })
})
