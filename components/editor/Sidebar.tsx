import { useCallback, useState } from 'react'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'
import { useSessionStore } from '@/lib/store/sessionStore'
import { useSavedPalettesStore } from '@/lib/store/savedPalettesStore'
import { oklchToRgb, isInSrgb } from '@/lib/color/oklch/format'
import { ColorSwatch } from './ColorSwatch'
import { AddColorInput } from './AddColorInput'
import { ThemeToggle } from './ThemeToggle'
import { CloudPalettesPanel } from './CloudPalettesPanel'
import { AuthModal } from '@/components/auth/AuthModal'
import { supabase } from '@/lib/supabase/client'
import type { Color, OKLCH } from '@/lib/color/types'

function SavedPalettesPanel() {
  const colors     = usePaletteStore((s) => s.colors)
  const addColor   = usePaletteStore((s) => s.addColor)
  const reset      = usePaletteStore((s) => s.reset)
  const { palettes, save, remove } = useSavedPalettesStore()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')

  const handleSave = () => {
    const trimmed = name.trim() || `Palette ${new Date().toLocaleDateString()}`
    save(trimmed, colors)
    setName('')
    setSaving(false)
  }

  const handleLoad = (palette: (typeof palettes)[number]) => {
    reset()
    for (const c of palette.colors) addColor(c)
    usePaletteStore.temporal.getState().clear()
  }

  return (
    <div className="border-t border-border">
      <button
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        <span>Saved Palettes ({palettes.length})</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {saving ? (
            <div className="flex gap-1">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setSaving(false) }}
                placeholder="Palette name…"
                className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
              />
              <button onClick={handleSave}
                className="rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                Save
              </button>
              <button onClick={() => setSaving(false)}
                className="rounded border border-border px-2 py-1 text-xs text-muted-foreground">
                ✕
              </button>
            </div>
          ) : (
            <button
              disabled={colors.length === 0}
              onClick={() => setSaving(true)}
              className="w-full rounded border border-dashed border-border py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              + Save current palette
            </button>
          )}

          {palettes.length === 0 ? (
            <p className="text-center text-[10px] text-muted-foreground py-2">No saved palettes yet</p>
          ) : (
            <ul className="space-y-1 max-h-40 overflow-y-auto">
              {palettes.map((p) => (
                <li key={p.id} className="flex items-center gap-1 group">
                  <button
                    onClick={() => handleLoad(p)}
                    className="flex flex-1 items-center gap-1.5 rounded px-1.5 py-1 text-left hover:bg-muted"
                  >
                    <span className="flex gap-0.5">
                      {p.colors.slice(0, 5).map((c) => (
                        <span key={c.id} className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                      ))}
                    </span>
                    <span className="truncate text-xs">{p.name}</span>
                    <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{p.colors.length}c</span>
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="shrink-0 rounded px-1 py-1 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const colors = usePaletteStore((s) => s.colors)
  const addColor = usePaletteStore((s) => s.addColor)
  const removeColor = usePaletteStore((s) => s.removeColor)
  const updateColor = usePaletteStore((s) => s.updateColor)
  const selectedColorId = useUIStore((s) => s.selectedColorId)
  const selectColor = useUIStore((s) => s.selectColor)
  const userId = useSessionStore((s) => s.userId)
  const [authOpen, setAuthOpen] = useState(false)

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
        <div className="flex items-center gap-1">
          {supabase && !userId && (
            <button
              onClick={() => setAuthOpen(true)}
              className="rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground border border-border"
            >
              Sign in
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
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
                onUpdate={updateColor}
              />
            ))}
          </ul>
        )}
      </div>
      <SavedPalettesPanel />
      <CloudPalettesPanel />
    </div>
  )
}
