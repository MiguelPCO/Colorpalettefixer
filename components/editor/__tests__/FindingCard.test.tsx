import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FindingCard } from '../findings/FindingCard'
import type { Finding } from '@/lib/color/types'

const FINDING: Finding = {
  id: 'f1',
  type: 'contrast-failure',
  rule: 'WCAG 2.2 SC 1.4.3',
  ruleLabel: 'rule',
  severity: 'critical',
  affectedColorIds: ['c1'],
  explanation: 'Color #df8600 on #ffffff has ratio 2.8:1, needs 4.5:1.',
  suggestion: {
    targetColorId: 'c1',
    newOklch: { l: 0.45, c: 0.15, h: 70 },
    delta: { dL: -0.1, dC: 0, dH: 0 },
    explanation: 'Lower L to 0.45',
    preservedAxis: 'hue',
    highDelta: false,
  },
}

const FINDING_NO_SUGGESTION: Finding = {
  id: 'f2',
  type: 'no-neutral',
  rule: 'heuristic',
  ruleLabel: 'heuristic',
  severity: 'warning',
  affectedColorIds: [],
  explanation: 'No neutral color in palette.',
}

describe('FindingCard', () => {
  it('is collapsed by default — explanation not visible', () => {
    render(
      <FindingCard
        finding={FINDING}
        isOpen={false}
        onToggle={vi.fn()}
        onIgnore={vi.fn()}
      />,
    )
    expect(screen.queryByText(FINDING.explanation)).not.toBeInTheDocument()
  })

  it('collapsed card shows rule label', () => {
    render(
      <FindingCard
        finding={FINDING}
        isOpen={false}
        onToggle={vi.fn()}
        onIgnore={vi.fn()}
      />,
    )
    expect(screen.getByText(/WCAG 2.2 SC 1.4.3/i)).toBeInTheDocument()
  })

  it('expanded card shows explanation', () => {
    render(
      <FindingCard
        finding={FINDING}
        isOpen={true}
        onToggle={vi.fn()}
        onIgnore={vi.fn()}
      />,
    )
    expect(screen.getByText(FINDING.explanation)).toBeInTheDocument()
  })

  it('expanded card shows tip block', () => {
    render(
      <FindingCard
        finding={FINDING}
        isOpen={true}
        onToggle={vi.fn()}
        onIgnore={vi.fn()}
      />,
    )
    expect(screen.getByText(/how to fix/i)).toBeInTheDocument()
  })

  it('expanded card shows WCAG reference link', () => {
    render(
      <FindingCard
        finding={FINDING}
        isOpen={true}
        onToggle={vi.fn()}
        onIgnore={vi.fn()}
      />,
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', expect.stringContaining('wcag'))
  })

  it('expanded card shows before/after swatches when suggestion exists', () => {
    render(
      <FindingCard
        finding={FINDING}
        isOpen={true}
        onToggle={vi.fn()}
        onIgnore={vi.fn()}
        currentHex="#df8600"
      />,
    )
    expect(screen.getByText(/before/i)).toBeInTheDocument()
    expect(screen.getByText(/after/i)).toBeInTheDocument()
  })

  it('no swatches when suggestion is absent', () => {
    render(
      <FindingCard
        finding={FINDING_NO_SUGGESTION}
        isOpen={true}
        onToggle={vi.fn()}
        onIgnore={vi.fn()}
      />,
    )
    expect(screen.queryByText(/before/i)).not.toBeInTheDocument()
  })

  it('clicking header calls onToggle', () => {
    const onToggle = vi.fn()
    render(
      <FindingCard
        finding={FINDING}
        isOpen={false}
        onToggle={onToggle}
        onIgnore={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('Fix button calls onFix when expanded', () => {
    const onFix = vi.fn()
    render(
      <FindingCard
        finding={FINDING}
        isOpen={true}
        onToggle={vi.fn()}
        onIgnore={vi.fn()}
        onFix={onFix}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /fix/i }))
    expect(onFix).toHaveBeenCalledWith(FINDING)
  })

  it('Ignore button calls onIgnore when expanded', () => {
    const onIgnore = vi.fn()
    render(
      <FindingCard
        finding={FINDING}
        isOpen={true}
        onToggle={vi.fn()}
        onIgnore={onIgnore}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /ignore/i }))
    expect(onIgnore).toHaveBeenCalledWith('f1')
  })
})
