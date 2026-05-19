import { useMemo, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'
import { detectHarmony } from '@/lib/color/harmony/detect'
import { Button } from '@/components/ui/button'
import { ALL_ROLES } from '@/lib/color/roles/constants'
import { cn } from '@/lib/utils'
import type { Color, GeneratedSystem, Role } from '@/lib/color/types'

interface MainCanvasProps {
  onAnalyze: () => void
}

function currentRole(system: GeneratedSystem | null, colorId: string): Role | null {
  if (!system?.roles) return null
  for (const [role, color] of Object.entries(system.roles)) {
    if (color?.id === colorId) return role as Role
  }
  return null
}

export function MainCanvas({ onAnalyze }: MainCanvasProps) {
  const colors             = usePaletteStore((s) => s.colors)
  const isAnalyzing        = usePaletteStore((s) => s.isAnalyzing)
  const generatedSystem    = usePaletteStore((s) => s.generatedSystem)
  const setGeneratedSystem = usePaletteStore((s) => s.setGeneratedSystem)
  const selectedColorId    = useUIStore((s) => s.selectedColorId)
  const selectColor        = useUIStore((s) => s.selectColor)

  const harmony = useMemo(
    () => (colors.length >= 2 ? detectHarmony(colors.map((c) => c.oklch)) : null),
    [colors],
  )

  const handleRoleChange = useCallback(
    (colorId: string, newRole: Role | '') => {
      if (!generatedSystem) return
      const color = colors.find((c) => c.id === colorId)
      if (!color) return
      const updatedRoles = { ...generatedSystem.roles }
      for (const r of Object.keys(updatedRoles) as Role[]) {
        if (updatedRoles[r]?.id === colorId) delete updatedRoles[r]
      }
      if (newRole) updatedRoles[newRole as Role] = color
      setGeneratedSystem({ ...generatedSystem, roles: updatedRoles })
    },
    [generatedSystem, colors, setGeneratedSystem],
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Color Grid</span>
          {harmony && harmony.confidence !== 'none' && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
              {harmony.template}
              <span className="ml-1 opacity-60">({harmony.confidence})</span>
            </span>
          )}
        </div>
        <Button
          size="sm"
          onClick={onAnalyze}
          disabled={isAnalyzing || colors.length < 2}
        >
          {isAnalyzing ? (
            <>
              <Loader2 role="status" className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Analyzing…
            </>
          ) : (
            'Analyze Palette'
          )}
        </Button>
      </div>

      {colors.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">Add at least 2 colors to start</p>
        </div>
      ) : (
        <div
          className="grid auto-rows-fr gap-3 p-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}
        >
          {colors.map((c) => (
            <div
              key={c.id}
              className={cn(
                'flex flex-col overflow-hidden rounded-lg border border-black/10 transition-shadow',
                c.id === selectedColorId && 'ring-2 ring-primary shadow-md',
              )}
            >
              <button
                className="block h-20 w-full cursor-pointer"
                style={{ backgroundColor: c.hex }}
                aria-label={`Select color ${c.hex}`}
                onClick={() => selectColor(c.id === selectedColorId ? null : c.id)}
              />
              <div className="bg-background px-2 py-1.5">
                <span className="block font-mono text-xs">{c.hex}</span>
                <span className={cn('block text-xs text-muted-foreground truncate', !c.name && 'invisible')}>
                  {c.name ?? ' '}
                </span>
                <select
                  value={currentRole(generatedSystem, c.id) ?? ''}
                  onChange={(e) => handleRoleChange(c.id, e.target.value as Role | '')}
                  disabled={!generatedSystem}
                  className="mt-1 w-full rounded border border-border bg-background text-[10px] text-muted-foreground disabled:opacity-40"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">—</option>
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
