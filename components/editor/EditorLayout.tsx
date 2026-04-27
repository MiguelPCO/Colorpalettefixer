import type { ReactNode } from 'react'

interface EditorLayoutProps {
  sidebar: ReactNode
  main: ReactNode
  inspector: ReactNode
}

export function EditorLayout({ sidebar, main, inspector }: EditorLayoutProps) {
  return (
    <div className="grid h-screen overflow-hidden" style={{ gridTemplateColumns: '280px 1fr 360px' }}>
      <aside className="border-r border-border overflow-y-auto bg-background">
        {sidebar}
      </aside>
      <main className="overflow-y-auto bg-muted/30">
        {main}
      </main>
      <aside className="border-l border-border overflow-y-auto bg-background">
        {inspector}
      </aside>
    </div>
  )
}
