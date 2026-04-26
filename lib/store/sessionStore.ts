import { create } from 'zustand'

interface SessionState {
  userId: string | null
  isPro: boolean
  paletteCount: number
  setUserId: (id: string | null) => void
  setIsPro: (v: boolean) => void
  setPaletteCount: (n: number) => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  userId: null,
  isPro: false,
  paletteCount: 0,
  setUserId: (userId) => set({ userId }),
  setIsPro: (isPro) => set({ isPro }),
  setPaletteCount: (paletteCount) => set({ paletteCount }),
}))
