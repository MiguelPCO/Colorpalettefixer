import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FindingsPanel } from '../findings/FindingsPanel'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'
import type { Finding } from '@/lib/color/types'

vi.mock('@/lib/store/paletteStore', () => ({ usePaletteStore: vi.fn() }))
vi.mock('@/lib/store/uiStore', () => ({ useUIStore: vi.fn() }))

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
      sel({ findings, ignoreFinding, batchUpdateColors: vi.fn(), colors: [] }),
    )
    vi.mocked(useUIStore).mockImplementation((sel: any) =>
      sel({ findingsFilter: filter, setFindingsFilter: vi.fn() }),
    )
    return { ignoreFinding }
  }

  it('shows empty state when no findings', () => {
    setupMocks([])
    render(<FindingsPanel onFix={vi.fn()} />)
    expect(screen.getByText(/no issues found/i)).toBeInTheDocument()
  })

  it('renders finding card', () => {
    setupMocks([FINDING])
    render(<FindingsPanel onFix={vi.fn()} />)
    expect(screen.getByText(FINDING.rule)).toBeInTheDocument()
  })

  it('ignore button calls ignoreFinding', () => {
    const { ignoreFinding } = setupMocks([FINDING])
    render(<FindingsPanel onFix={vi.fn()} />)
    // Open the card first so the Ignore button becomes visible
    fireEvent.click(screen.getByRole('button', { expanded: false }))
    fireEvent.click(screen.getByRole('button', { name: /ignore/i }))
    expect(ignoreFinding).toHaveBeenCalledWith('f1')
  })

  const FINDING_WITH_SUG: Finding = {
    id: 'f2',
    type: 'contrast-failure',
    rule: 'WCAG 2.2 SC 1.4.3',
    ruleLabel: 'rule',
    severity: 'critical',
    affectedColorIds: ['c1'],
    explanation: 'Ratio 2.8:1',
    suggestion: {
      targetColorId: 'c1',
      newOklch: { l: 0.4, c: 0.15, h: 70 },
      delta: { dL: -0.1, dC: 0, dH: 0 },
      explanation: '',
      preservedAxis: 'hue',
      highDelta: false,
    },
  }

  it('cards are collapsed by default', () => {
    setupMocks([FINDING])
    render(<FindingsPanel onFix={vi.fn()} />)
    expect(screen.queryByText(FINDING.explanation)).not.toBeInTheDocument()
  })

  it('clicking a card expands it', () => {
    setupMocks([FINDING])
    render(<FindingsPanel onFix={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { expanded: false }))
    expect(screen.getByText(FINDING.explanation)).toBeInTheDocument()
  })

  it('only one card open at a time', () => {
    const secondExplanation = 'Second explanation'
    setupMocks([FINDING, { ...FINDING_WITH_SUG, id: 'f3', explanation: secondExplanation }])
    render(<FindingsPanel onFix={vi.fn()} />)

    // Open first card
    const [firstBtn] = screen.getAllByRole('button', { expanded: false })
    fireEvent.click(firstBtn)
    expect(screen.getByText(FINDING.explanation)).toBeInTheDocument()

    // Open second card — first should close
    fireEvent.click(screen.getByRole('button', { expanded: false }))
    expect(screen.queryByText(FINDING.explanation)).not.toBeInTheDocument()
    expect(screen.getByText(secondExplanation)).toBeInTheDocument()
  })
})
