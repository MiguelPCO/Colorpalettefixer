import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'
import { detectHarmony } from '@/lib/color/harmony/detect'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MainCanvasProps {
  onAnalyze: () => void
}

export function MainCanvas({ onAnalyze }: MainCanvasProps) {
  const colors = usePaletteStore((s) => s.colors)
  const isAnalyzing = usePaletteStore((s) => s.isAnalyzing)
  const selectedColorId = useUIStore((s) => s.selectedColorId)
  const selectColor = useUIStore((s) => s.selectColor)

  const harmony = useMemo(
    () => (colors.length >= 2 ? detectHarmony(colors.map((c) => c.oklch)) : null),
    [colors],
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
            <button
              key={c.id}
              onClick={() => selectColor(c.id === selectedColorId ? null : c.id)}
              className={cn(
                'flex flex-col overflow-hidden rounded-lg border border-black/10 transition-shadow',
                c.id === selectedColorId && 'ring-2 ring-primary shadow-md',
              )}
            >
              <span className="block h-20 w-full" style={{ backgroundColor: c.hex }} />
              <span className="bg-background px-2 py-1.5 text-left">
                <span className="block font-mono text-xs">{c.hex}</span>
                <span className={cn('block text-xs text-muted-foreground truncate', !c.name && 'invisible')}>
                  {c.name ?? ' '}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
