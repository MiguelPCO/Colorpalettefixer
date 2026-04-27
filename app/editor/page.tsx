import { EditorLayout } from '@/components/editor/EditorLayout'

export default function EditorPage() {
  return (
    <EditorLayout
      sidebar={<div className="p-4 text-sm text-muted-foreground">Sidebar (coming soon)</div>}
      main={<div className="p-4 text-sm text-muted-foreground">Canvas (coming soon)</div>}
      inspector={<div className="p-4 text-sm text-muted-foreground">Inspector (coming soon)</div>}
    />
  )
}
