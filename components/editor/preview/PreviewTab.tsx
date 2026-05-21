'use client'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'
import { SystemPreview } from './SystemPreview'

const activeBtn  = 'rounded px-2 py-0.5 text-xs font-semibold bg-foreground text-background'
const inactiveBtn = 'rounded px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground'

export function PreviewTab() {
  const system      = usePaletteStore((s) => s.generatedSystem)
  const previewMode = useUIStore((s) => s.previewMode)
  const setPreviewMode = useUIStore((s) => s.setPreviewMode)

  if (!system) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-center text-sm text-muted-foreground">
          Run <strong>Analyze</strong> to preview components
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground">Component Preview</span>
        <div className="flex gap-1 rounded-md border border-border p-0.5">
          <button className={previewMode === 'light' ? activeBtn : inactiveBtn} onClick={() => setPreviewMode('light')}>Light</button>
          <button className={previewMode === 'dark'  ? activeBtn : inactiveBtn} onClick={() => setPreviewMode('dark')}>Dark</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <SystemPreview system={system} previewMode={previewMode} />
      </div>
    </div>
  )
}
