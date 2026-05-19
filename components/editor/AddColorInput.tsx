import { useState } from 'react'
import { parseColorInput } from '@/lib/color/parseInput'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { OKLCH } from '@/lib/color/types'

interface AddColorInputProps {
  onAdd: (hex: string, oklch: OKLCH) => void
}

export function AddColorInput({ onAdd }: AddColorInputProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    const result = parseColorInput(value)
    if (!result) {
      setError('Invalid color — try #hex, rgb(r g b), hsl(h s% l%) or oklch(l c h)')
      return
    }
    setError(null)
    setValue('')
    onAdd(result.hex, result.oklch)
  }

  return (
    <div className="p-3 border-b border-border space-y-1.5">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null) }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="#hex · rgb · hsl · oklch"
          className="font-mono text-xs h-8"
        />
        <Button size="sm" onClick={submit} className="h-8">Add</Button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
