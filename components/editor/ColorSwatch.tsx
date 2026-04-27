import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import type { Color } from '@/lib/color/types'

interface ColorSwatchProps {
  color: Color
  selected?: boolean
  onSelect: (id: string) => void
  onRemove: (id: string) => void
}

export function ColorSwatch({ color, selected, onSelect, onRemove }: ColorSwatchProps) {
  return (
    <li
      className={cn(
        'group flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer hover:bg-muted transition-colors',
        selected && 'bg-muted ring-2 ring-primary',
      )}
      onClick={() => onSelect(color.id)}
    >
      <span
        className="h-6 w-6 shrink-0 rounded border border-black/10"
        style={{ backgroundColor: color.hex }}
        aria-hidden
      />
      <span className="flex-1 truncate font-mono text-xs">{color.hex}</span>
      {color.name && (
        <span className="truncate text-xs text-muted-foreground">{color.name}</span>
      )}
      <button
        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => { e.stopPropagation(); onRemove(color.id) }}
        aria-label={`Remove ${color.hex}`}
      >
        <X className="h-3 w-3" />
      </button>
    </li>
  )
}
