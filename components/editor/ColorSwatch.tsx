'use client'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { parseToOklch } from '@/lib/color/oklch/parse'
import { oklchToHex, oklchToRgb, isInSrgb } from '@/lib/color/oklch/format'
import type { Color } from '@/lib/color/types'

interface ColorSwatchProps {
  color: Color
  selected?: boolean
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, patch: Partial<Color>) => void
}

const HEX_RE = /^#?([0-9a-fA-F]{6})$/

export function ColorSwatch({ color, selected, onSelect, onRemove, onUpdate }: ColorSwatchProps) {
  const [draftHex, setDraftHex] = useState(color.hex)
  const [draftName, setDraftName] = useState(color.name ?? '')

  useEffect(() => {
    setDraftHex(color.hex)
    setDraftName(color.name ?? '')
  }, [color.id, color.hex, color.name])

  const commitHex = () => {
    const m = HEX_RE.exec(draftHex.trim())
    if (!m) { setDraftHex(color.hex); return }
    const normalized = `#${m[1]!.toLowerCase()}`
    const oklch = parseToOklch(normalized)
    if (!oklch) { setDraftHex(color.hex); return }
    onUpdate(color.id, {
      hex: normalized,
      oklch,
      rgb: oklchToRgb(oklch),
      inGamutSrgb: isInSrgb(oklch),
    })
  }

  const commitName = () => {
    const trimmed = draftName.trim()
    if (!trimmed) { setDraftName(color.name ?? ''); return }
    if (trimmed !== color.name) onUpdate(color.id, { name: trimmed })
  }

  return (
    <li
      className={cn(
        'group rounded-md px-2 py-1.5 cursor-pointer hover:bg-muted transition-colors',
        selected && 'bg-muted ring-2 ring-primary',
      )}
      onClick={() => onSelect(color.id)}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-6 w-6 shrink-0 rounded border border-black/10"
          style={{ backgroundColor: color.hex }}
          aria-hidden
        />
        <span className="flex-1 truncate font-mono text-xs">{color.hex}</span>
        {color.name && !selected && (
          <span className="truncate text-xs text-muted-foreground">{color.name}</span>
        )}
        <button
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => { e.stopPropagation(); onRemove(color.id) }}
          aria-label={`Remove ${color.hex}`}
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {selected && (
        <div className="mt-1.5 flex gap-1" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={draftHex}
            onChange={(e) => setDraftHex(e.target.value)}
            onBlur={commitHex}
            onKeyDown={(e) => { if (e.key === 'Enter') commitHex() }}
            className="w-24 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Hex value"
            spellCheck={false}
          />
          <input
            type="text"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === 'Enter') commitName() }}
            placeholder="name"
            className="min-w-0 flex-1 max-w-[7rem] rounded border border-border bg-background px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Color name"
          />
        </div>
      )}
    </li>
  )
}
