import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Color } from '@/lib/color/types'

interface FavoritesState {
  favorites: Color[]
  addFavorite: (color: Color) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (color) =>
        set((s) => ({
          favorites: s.favorites.some((f) => f.id === color.id)
            ? s.favorites
            : [...s.favorites, color],
        })),
      removeFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) })),
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
    }),
    { name: 'cpf-favorites-v1' },
  ),
)
