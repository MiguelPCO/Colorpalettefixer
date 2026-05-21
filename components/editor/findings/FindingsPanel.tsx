"use client"

import { useCallback, useState } from 'react'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore, type FindingsFilter } from '@/lib/store/uiStore'
import { oklchToHex, oklchToRgb, isInSrgb } from '@/lib/color/oklch/format'
import { applyToPalette } from '@/lib/color/fix/applyToPalette'
import { FindingCard } from './FindingCard'
import type { Color, Finding } from '@/lib/color/types'

interface FindingsPanelProps {
  onFix: (colorId: string, patch: Partial<Color>) => void
}

const FILTERS: FindingsFilter[] = ['all', 'critical', 'warning', 'info']

export function FindingsPanel({ onFix }: FindingsPanelProps) {
  const findings = usePaletteStore((s) => s.findings)
  const colors = usePaletteStore((s) => s.colors)
  const batchUpdateColors = usePaletteStore((s) => s.batchUpdateColors)
  const ignoreFinding = usePaletteStore((s) => s.ignoreFinding)
  const filter = useUIStore((s) => s.findingsFilter)
  const setFilter = useUIStore((s) => s.setFindingsFilter)

  const [openFindingId, setOpenFindingId] = useState<string | null>(null)

  const handleFix = useCallback(
    (finding: Finding) => {
      const { suggestion } = finding
      if (!suggestion) return
      const { targetColorId, newOklch } = suggestion
      onFix(targetColorId, {
        oklch: newOklch,
        hex: oklchToHex(newOklch),
        rgb: oklchToRgb(newOklch),
        inGamutSrgb: isInSrgb(newOklch),
      })
    },
    [onFix],
  )

  const handleFixAll = useCallback(() => {
    const patches = applyToPalette(findings).map(({ id, newOklch }) => ({
      id,
      patch: {
        oklch: newOklch,
        hex: oklchToHex(newOklch),
        rgb: oklchToRgb(newOklch),
        inGamutSrgb: isInSrgb(newOklch),
      },
    }))
    batchUpdateColors(patches)
  }, [findings, batchUpdateColors])

  const fixableCount = findings.filter((f) => f.suggestion).length
  const visible = filter === 'all'
    ? findings
    : findings.filter((f) => f.severity === filter)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 border-b border-border p-2">
        <div className="flex gap-1 flex-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {f === 'all' ? `All (${findings.length})` : f}
            </button>
          ))}
        </div>
        {fixableCount > 0 && (
          <button
            onClick={handleFixAll}
            className="rounded px-2 py-0.5 text-xs bg-green-600 text-white hover:bg-green-700 transition-colors shrink-0"
          >
            Fix All ({fixableCount})
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {visible.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No issues found — great palette!
          </p>
        ) : (
          visible.map((f) => (
            <FindingCard
              key={f.id}
              finding={f}
              isOpen={openFindingId === f.id}
              onToggle={() => setOpenFindingId(openFindingId === f.id ? null : f.id)}
              onIgnore={ignoreFinding}
              onFix={handleFix}
              {...(() => {
                const hex = f.suggestion
                  ? colors.find((c) => c.id === f.suggestion!.targetColorId)?.hex
                  : undefined
                return hex !== undefined ? { currentHex: hex } : {}
              })()}
            />
          ))
        )}
      </div>
    </div>
  )
}
