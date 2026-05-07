import { useCallback } from 'react'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'
import { oklchToRgb, isInSrgb } from '@/lib/color/oklch/format'
import { ColorSwatch } from './ColorSwatch'
import { AddColorInput } from './AddColorInput'
import { ThemeToggle } from './ThemeToggle'
import type { Color, OKLCH } from '@/lib/color/types'

export function Sidebar() {
  const colors = usePaletteStore((s) => s.colors)
  const addColor = usePaletteStore((s) => s.addColor)
  const removeColor = usePaletteStore((s) => s.removeColor)
  const selectedColorId = useUIStore((s) => s.selectedColorId)
  const selectColor = useUIStore((s) => s.selectColor)

  const handleAdd = useCallback(
    (hex: string, oklch: OKLCH) => {
      const rgb = oklchToRgb(oklch)
      const color: Color = {
        id: crypto.randomUUID(),
        hex,
        oklch,
        rgb,
        inGamutSrgb: isInSrgb(oklch),
      }
      addColor(color)
    },
    [addColor],
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold">Palette</h2>
          <p className="text-xs text-muted-foreground">{colors.length}/16 colors</p>
        </div>
        <ThemeToggle />
      </div>
      <AddColorInput onAdd={handleAdd} />
      <div className="flex-1 overflow-y-auto p-2">
        {colors.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No colors yet — add one above
          </p>
        ) : (
          <ul className="space-y-0.5">
            {colors.map((c) => (
              <ColorSwatch
                key={c.id}
                color={c}
                selected={c.id === selectedColorId}
                onSelect={selectColor}
                onRemove={removeColor}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
