'use client'

import { useCallback, type ReactNode } from 'react'
import { useUIStore } from '@/lib/store/uiStore'

interface EditorLayoutProps {
  sidebar: ReactNode
  main: ReactNode
  inspector: ReactNode
}

export function EditorLayout({ sidebar, main, inspector }: EditorLayoutProps) {
  const inspectorWidth = useUIStore((s) => s.inspectorWidth)
  const setInspectorWidth = useUIStore((s) => s.setInspectorWidth)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = inspectorWidth
    document.body.style.cursor = 'col-resize'

    function onMove(ev: MouseEvent) {
      const delta = startX - ev.clientX
      setInspectorWidth(Math.min(560, Math.max(280, startWidth + delta)))
    }

    function onUp() {
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [inspectorWidth, setInspectorWidth])

  return (
    <div
      className="grid h-screen overflow-hidden"
      style={{ gridTemplateColumns: `280px 1fr 4px ${inspectorWidth}px` }}
    >
      <aside className="border-r border-border overflow-y-auto bg-background">
        {sidebar}
      </aside>
      <main className="overflow-y-auto bg-muted/30">
        {main}
      </main>
      <div
        className="cursor-col-resize bg-border hover:bg-primary transition-colors shrink-0"
        onMouseDown={handleMouseDown}
        data-testid="drag-handle"
      />
      <aside className="overflow-y-auto bg-background">
        {inspector}
      </aside>
    </div>
  )
}
