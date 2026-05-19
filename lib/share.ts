import LZString from 'lz-string'
import type { Color } from './color/types'

interface ShareEntry {
  l: number
  c: number
  h: number
  n?: string
}

export function encodeShareHash(colors: Color[]): string {
  const payload: ShareEntry[] = colors.map((c) => {
    const entry: ShareEntry = {
      l: Math.round(c.oklch.l * 10000) / 10000,
      c: Math.round(c.oklch.c * 10000) / 10000,
      h: Math.round(c.oklch.h * 100) / 100,
    }
    if (c.name) entry.n = c.name
    return entry
  })
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload))
}

export function decodeShareHash(hash: string): ShareEntry[] | null {
  try {
    const raw = LZString.decompressFromEncodedURIComponent(hash)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    return parsed as ShareEntry[]
  } catch {
    return null
  }
}
