'use client'
import { useCallback } from 'react'
import { EditorLayout } from '@/components/editor/EditorLayout'
import { Sidebar } from '@/components/editor/Sidebar'
import { MainCanvas } from '@/components/editor/MainCanvas'
import { Inspector } from '@/components/editor/Inspector'
import { useAutosave } from '@/lib/store/autosave'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'
import { runDiagnostics } from '@/lib/color/diagnostics/run'

export default function EditorPage() {
  useAutosave()
  const colors = usePaletteStore((s) => s.colors)
  const setFindings = usePaletteStore((s) => s.setFindings)
  const setIsAnalyzing = usePaletteStore((s) => s.setIsAnalyzing)
  const setActiveTab = useUIStore((s) => s.setActiveTab)

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true)
    await new Promise((r) => setTimeout(r, 0)) // yield to render
    const findings = runDiagnostics(colors)     // returns Finding[] directly
    setFindings(findings)
    setIsAnalyzing(false)
    setActiveTab('findings')
  }, [colors, setFindings, setIsAnalyzing, setActiveTab])

  return (
    <EditorLayout
      sidebar={<Sidebar />}
      main={<MainCanvas onAnalyze={handleAnalyze} />}
      inspector={<Inspector />}
    />
  )
}
