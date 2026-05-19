'use client'
import { useState, useEffect, useCallback } from 'react'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useSessionStore } from '@/lib/store/sessionStore'
import { supabase } from '@/lib/supabase/client'
import {
  fetchCloudPalettes,
  saveCloudPalette,
  deleteCloudPalette,
  type CloudPalette,
} from '@/lib/cloud/palettes'

export function CloudPalettesPanel() {
  const colors   = usePaletteStore((s) => s.colors)
  const addColor = usePaletteStore((s) => s.addColor)
  const reset    = usePaletteStore((s) => s.reset)
  const userId   = useSessionStore((s) => s.userId)

  const [open, setOpen]       = useState(false)
  const [palettes, setPalettes] = useState<CloudPalette[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [name, setName]       = useState('')
  const [error, setError]     = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setPalettes(await fetchCloudPalettes())
    setLoading(false)
  }, [])

  useEffect(() => {
    if (open && userId) load()
  }, [open, userId, load])

  const handleSave = async () => {
    const trimmed = name.trim() || `Palette ${new Date().toLocaleDateString()}`
    setError(null)
    const saved = await saveCloudPalette(trimmed, colors)
    if (!saved) { setError('Failed to save.'); return }
    setName('')
    setSaving(false)
    setPalettes((prev) => [saved, ...prev])
  }

  const handleLoad = (p: CloudPalette) => {
    reset()
    for (const c of p.colors) addColor(c)
    usePaletteStore.temporal.getState().clear()
  }

  const handleDelete = async (id: string) => {
    await deleteCloudPalette(id)
    setPalettes((prev) => prev.filter((p) => p.id !== id))
  }

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut()
  }

  if (!userId) return null

  return (
    <div className="border-t border-border">
      <button
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        <span>Cloud Palettes</span>
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
            <div className="flex gap-1">
              <button
                disabled={colors.length === 0}
                onClick={() => setSaving(true)}
                className="flex-1 rounded border border-dashed border-border py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                + Save to cloud
              </button>
              <button onClick={load} title="Refresh"
                className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
                ↻
              </button>
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          {loading ? (
            <p className="text-center text-[10px] text-muted-foreground py-2">Loading…</p>
          ) : palettes.length === 0 ? (
            <p className="text-center text-[10px] text-muted-foreground py-2">No cloud palettes yet</p>
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
                    onClick={() => handleDelete(p.id)}
                    className="shrink-0 rounded px-1 py-1 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button onClick={handleSignOut}
            className="w-full rounded border border-border py-1 text-[10px] text-muted-foreground hover:text-destructive">
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
