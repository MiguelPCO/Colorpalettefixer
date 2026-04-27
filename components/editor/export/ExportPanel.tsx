'use client'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useSessionStore } from '@/lib/store/sessionStore'
import { cn } from '@/lib/utils'

export type ExportFormat = 'css' | 'dtcg' | 'tailwind' | 'scss' | 'style-dictionary' | 'figma' | 'ios' | 'android'

interface FormatDef {
  id: ExportFormat
  label: string
  description: string
  proOnly: boolean
}

const FORMATS: FormatDef[] = [
  { id: 'css',              label: 'CSS Variables',    description: ':root { --color-primary: … }',       proOnly: false },
  { id: 'dtcg',             label: 'DTCG W3C',         description: 'Design Token Community Group v1',    proOnly: false },
  { id: 'tailwind',         label: 'Tailwind v4',      description: '@theme { --color-primary: … }',      proOnly: false },
  { id: 'scss',             label: 'SCSS Map',          description: '$colors: (primary: …)',              proOnly: true  },
  { id: 'style-dictionary', label: 'Style Dictionary', description: 'tokens.json for SD transforms',      proOnly: true  },
  { id: 'figma',            label: 'Figma Tokens',      description: 'Figma Variables-compatible JSON',    proOnly: true  },
  { id: 'ios',              label: 'iOS Swift',         description: 'UIColor extension + SwiftUI Color',  proOnly: true  },
  { id: 'android',          label: 'Android XML',       description: 'res/values/colors.xml',             proOnly: true  },
]

interface ExportPanelProps {
  onExport: (format: ExportFormat) => void
}

export function ExportPanel({ onExport }: ExportPanelProps) {
  const system = usePaletteStore((s) => s.generatedSystem)
  const isPro  = useSessionStore((s) => s.isPro)

  if (!system) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-center text-sm text-muted-foreground">
          Run <strong>Analyze</strong> to export tokens
        </p>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-2">
      <p className="text-xs text-muted-foreground mb-3">
        Choose a format to download your design tokens
      </p>
      {FORMATS.map((fmt) => {
        const locked = fmt.proOnly && !isPro
        return (
          <div
            key={fmt.id}
            className={cn(
              'flex items-center gap-3 rounded-md border border-border p-3 transition-colors',
              locked ? 'opacity-60' : 'hover:bg-muted cursor-pointer',
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium">{fmt.label}</span>
                {locked && (
                  <Lock className="h-3 w-3 text-muted-foreground" aria-label="Pro feature" />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{fmt.description}</p>
            </div>
            {locked ? (
              <Button size="sm" variant="outline" className="h-7 text-xs shrink-0">
                Upgrade
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs shrink-0"
                onClick={() => onExport(fmt.id)}
                aria-label={fmt.label}
              >
                Download
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
