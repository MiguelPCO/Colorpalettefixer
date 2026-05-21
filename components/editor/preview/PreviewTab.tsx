'use client'
import { useState } from 'react'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'
import { SystemPreview } from './SystemPreview'
import { LandingScene } from './scenes/LandingScene'
import { DashboardScene } from './scenes/DashboardScene'
import { MobileScene } from './scenes/MobileScene'

type Scene = 'landing' | 'dashboard' | 'mobile' | 'components'

const SCENES: { id: Scene; label: string }[] = [
  { id: 'landing',    label: 'Landing' },
  { id: 'dashboard',  label: 'Dashboard' },
  { id: 'mobile',     label: 'Mobile' },
  { id: 'components', label: 'Components' },
]

const activeBtn   = 'rounded px-2 py-0.5 text-xs font-semibold bg-foreground text-background'
const inactiveBtn = 'rounded px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground'

export function PreviewTab() {
  const system         = usePaletteStore((s) => s.generatedSystem)
  const previewMode    = useUIStore((s) => s.previewMode)
  const setPreviewMode = useUIStore((s) => s.setPreviewMode)
  const [activeScene, setActiveScene] = useState<Scene>('landing')

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
      {/* Top bar: scene tabs + light/dark toggle */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border gap-2">
        <div className="flex gap-1 rounded-md border border-border p-0.5">
          {SCENES.map(({ id, label }) => (
            <button
              key={id}
              className={activeScene === id ? activeBtn : inactiveBtn}
              onClick={() => setActiveScene(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-md border border-border p-0.5">
          <button className={previewMode === 'light' ? activeBtn : inactiveBtn} onClick={() => setPreviewMode('light')}>Light</button>
          <button className={previewMode === 'dark'  ? activeBtn : inactiveBtn} onClick={() => setPreviewMode('dark')}>Dark</button>
        </div>
      </div>

      {/* Scene content */}
      <div className="flex-1 overflow-auto">
        {activeScene === 'landing'    && <LandingScene    system={system} previewMode={previewMode} />}
        {activeScene === 'dashboard'  && <DashboardScene  system={system} previewMode={previewMode} />}
        {activeScene === 'mobile'     && <MobileScene     system={system} previewMode={previewMode} />}
        {activeScene === 'components' && <SystemPreview   system={system} previewMode={previewMode} />}
      </div>
    </div>
  )
}
