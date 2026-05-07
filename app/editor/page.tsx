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
import { assignRoles } from '@/lib/color/roles/assign'
import { generateRamp } from '@/lib/color/ramp/generate'
import { fixAlternatives } from '@/lib/color/fix/alternatives'
import { oklchToHex, oklchToRgb, isInSrgb } from '@/lib/color/oklch/format'
import { useEditorShortcuts } from '@/hooks/useEditorShortcuts'
import type { Color, GeneratedRamp, GeneratedSystem, OKLCH, Role } from '@/lib/color/types'

function toRamp(oklch: OKLCH): GeneratedRamp {
  return {
    light: generateRamp(oklch, 'light'),
    dark: generateRamp(oklch, 'dark'),
  }
}

const FALLBACK_PRIMARY: OKLCH = { l: 0.5, c: 0.15, h: 258 }
const FALLBACK_NEUTRAL: OKLCH = { l: 0.5, c: 0.01, h: 258 }

export default function EditorPage() {
  useAutosave()
  useEditorShortcuts()

  const colors = usePaletteStore((s) => s.colors)
  const setFindings = usePaletteStore((s) => s.setFindings)
  const setIsAnalyzing = usePaletteStore((s) => s.setIsAnalyzing)
  const setGeneratedSystem = usePaletteStore((s) => s.setGeneratedSystem)
  const updateColor = usePaletteStore((s) => s.updateColor)
  const setActiveTab = useUIStore((s) => s.setActiveTab)

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true)
    await new Promise((r) => setTimeout(r, 0))

    // 1. Diagnostics + attach fix suggestions to contrast-failure findings
    const rawFindings = runDiagnostics(colors)
    const findings = rawFindings.map((f) => {
      if (f.type === 'contrast-failure' && f.affectedColorIds.length >= 2) {
        const fgId = f.affectedColorIds[0]
        const bgId = f.affectedColorIds[1]
        const fg = colors.find((c) => c.id === fgId)
        const bg = colors.find((c) => c.id === bgId)
        if (fg && bg && fgId) {
          const [suggestion] = fixAlternatives(fg.oklch, bg.oklch, fgId)
          if (suggestion) return { ...f, suggestion }
        }
      }
      return f
    })
    setFindings(findings)

    // 2. Role assignment
    const { assignments, synthetics } = assignRoles(colors)

    // 3. Build roles map Color | null
    const rolesMap: Partial<Record<Role, Color | null>> = {}
    for (const [role, colorId] of Object.entries(assignments)) {
      rolesMap[role as Role] = colorId ? (colors.find((c) => c.id === colorId) ?? null) : null
    }
    for (const syn of synthetics) {
      if (!rolesMap[syn.role]) {
        const hex = oklchToHex(syn.oklch)
        const rgb = oklchToRgb(syn.oklch)
        rolesMap[syn.role] = {
          id: `synthetic-${syn.role}`,
          oklch: syn.oklch,
          hex,
          rgb,
          inGamutSrgb: isInSrgb(syn.oklch),
          name: syn.role,
        }
      }
    }

    // 4. Determine OKLCH for each ramp
    const lookup = (role: Role): OKLCH | null => {
      const id = assignments[role]
      return id ? (colors.find((c) => c.id === id)?.oklch ?? null) : null
    }
    const semanticOklch = (role: Role): OKLCH => {
      return lookup(role) ?? synthetics.find((s) => s.role === role)?.oklch ?? FALLBACK_PRIMARY
    }

    const primaryOklch = lookup('primary') ?? FALLBACK_PRIMARY
    const neutralOklch = lookup('neutral') ?? lookup('background') ?? FALLBACK_NEUTRAL

    const system: GeneratedSystem = {
      brand: toRamp(primaryOklch),
      neutral: toRamp(neutralOklch),
      success: toRamp(semanticOklch('success')),
      warning: toRamp(semanticOklch('warning')),
      error: toRamp(semanticOklch('error')),
      info: toRamp(semanticOklch('info')),
      roles: rolesMap,
    }

    setGeneratedSystem(system)
    setIsAnalyzing(false)
    setActiveTab('findings')
  }, [colors, setFindings, setIsAnalyzing, setGeneratedSystem, setActiveTab])

  const handleFix = useCallback(
    (colorId: string, patch: Partial<Color>) => {
      updateColor(colorId, patch)
    },
    [updateColor],
  )

  return (
    <EditorLayout
      sidebar={<Sidebar />}
      main={<MainCanvas onAnalyze={handleAnalyze} />}
      inspector={<Inspector onFix={handleFix} />}
    />
  )
}
