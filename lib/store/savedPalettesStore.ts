import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Color } from '@/lib/color/types'

export interface SavedPalette {
  id: string
  name: string
  colors: Color[]
  savedAt: number
}

interface SavedPalettesState {
  palettes: SavedPalette[]
  save: (name: string, colors: Color[]) => void
  remove: (id: string) => void
}

export const useSavedPalettesStore = create<SavedPalettesState>()(
  persist(
    (set) => ({
      palettes: [],
      save: (name, colors) =>
        set((s) => ({
          palettes: [
            { id: crypto.randomUUID(), name, colors, savedAt: Date.now() },
            ...s.palettes,
          ],
        })),
      remove: (id) => set((s) => ({ palettes: s.palettes.filter((p) => p.id !== id) })),
    }),
    { name: 'cpf-saved-palettes-v1' },
  ),
)
