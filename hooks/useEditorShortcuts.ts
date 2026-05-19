import { useEffect } from 'react'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'
import { encodeShareHash } from '@/lib/share'

export function useEditorShortcuts() {
  const togglePanel = useUIStore((s) => s.togglePanel)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F9') {
        e.preventDefault()
        const colors = usePaletteStore.getState().colors
        const hash = encodeShareHash(colors)
        const url = `${window.location.origin}${window.location.pathname}#${hash}`
        navigator.clipboard.writeText(url).catch(() => undefined)
        history.replaceState(null, '', `#${hash}`)
        return
      }

      const mod = e.metaKey || e.ctrlKey
      if (!mod) return

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        usePaletteStore.temporal.getState().undo()
      } else if (e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        usePaletteStore.temporal.getState().redo()
      } else if (e.key === '\\') {
        e.preventDefault()
        togglePanel()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [togglePanel])
}
