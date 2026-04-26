import { get, set as idbSet } from 'idb-keyval'
import { useEffect, useRef } from 'react'
import { usePaletteStore } from './paletteStore'
import type { Color } from '@/lib/color/types'

const IDB_KEY = 'cpf-palette-v1'

export function useAutosave() {
  const hasRestored = useRef(false)

  useEffect(() => {
    if (hasRestored.current) return
    hasRestored.current = true
    get<Color[]>(IDB_KEY).then((saved) => {
      if (saved?.length) {
        usePaletteStore.setState({ colors: saved })
      }
    })
  }, [])

  useEffect(() => {
    return usePaletteStore.subscribe((state) => {
      idbSet(IDB_KEY, state.colors)
    })
  }, [])
}
