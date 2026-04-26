import { create } from 'zustand'
import { temporal } from 'zundo'
import type { Color, Finding, GeneratedSystem } from '@/lib/color/types'

interface PaletteState {
  colors: Color[]
  findings: Finding[]
  generatedSystem: GeneratedSystem | null
  isAnalyzing: boolean
}

interface PaletteActions {
  addColor: (color: Color) => void
  removeColor: (id: string) => void
  updateColor: (id: string, patch: Partial<Color>) => void
  setFindings: (findings: Finding[]) => void
  setGeneratedSystem: (system: GeneratedSystem | null) => void
  setIsAnalyzing: (v: boolean) => void
  ignoreFinding: (id: string) => void
  reset: () => void
}

const INITIAL: PaletteState = {
  colors: [],
  findings: [],
  generatedSystem: null,
  isAnalyzing: false,
}

export const usePaletteStore = create<PaletteState & PaletteActions>()(
  temporal(
    (set) => ({
      ...INITIAL,
      addColor: (color) =>
        set((s) => ({ colors: [...s.colors, color] })),
      removeColor: (id) =>
        set((s) => ({ colors: s.colors.filter((c) => c.id !== id) })),
      updateColor: (id, patch) =>
        set((s) => ({
          colors: s.colors.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      setFindings: (findings) => set({ findings }),
      setGeneratedSystem: (generatedSystem) => set({ generatedSystem }),
      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      ignoreFinding: (id) =>
        set((s) => ({ findings: s.findings.filter((f) => f.id !== id) })),
      reset: () => set(INITIAL),
    }),
    {
      limit: 50,
      partialize: (s) => ({ colors: s.colors }),
    },
  ),
)
