import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EditorLayout } from '../EditorLayout'

describe('EditorLayout', () => {
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
})
