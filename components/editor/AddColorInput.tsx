import { useState } from 'react'
import { parseToOklch } from '@/lib/color/oklch/parse'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { OKLCH } from '@/lib/color/types'

const HEX_RE = /^#([0-9a-fA-F]{6})$/

interface AddColorInputProps {
  onAdd: (hex: string, oklch: OKLCH) => void
}

export function AddColorInput({ onAdd }: AddColorInputProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    const hex = value.startsWith('#') ? value : `#${value}`
    if (!HEX_RE.test(hex)) {
      setError('Enter a valid 6-digit hex color')
      return
    }
    const oklch = parseToOklch(hex)
    if (!oklch) {
      setError('Could not parse color')
      return
    }
    setError(null)
    setValue('')
    onAdd(hex.toLowerCase(), oklch)
  }

  return (
    <div className="p-3 border-b border-border space-y-1.5">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null) }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="#3b82f6"
          className="font-mono text-xs h-8"
          maxLength={7}
        />
        <Button size="sm" onClick={submit} className="h-8">Add</Button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
