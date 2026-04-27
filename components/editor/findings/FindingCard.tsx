"use client"

import { cn } from '@/lib/utils'
import { AlertTriangle, Info, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Finding } from '@/lib/color/types'

const SEVERITY_STYLES = {
  critical: 'border-l-destructive bg-destructive/5',
  warning: 'border-l-yellow-500 bg-yellow-500/5',
  info: 'border-l-blue-500 bg-blue-500/5',
} as const

const SEVERITY_ICONS = {
  critical: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const

interface FindingCardProps {
  finding: Finding
  onIgnore: (id: string) => void
  onFix?: (finding: Finding) => void
}

export function FindingCard({ finding, onIgnore, onFix }: FindingCardProps) {
  const Icon = SEVERITY_ICONS[finding.severity]

  return (
    <div className={cn('rounded-md border-l-4 p-3 space-y-2', SEVERITY_STYLES[finding.severity])}>
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium capitalize">{finding.rule.replace(/-/g, ' ')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{finding.explanation}</p>
        </div>
      </div>
      <div className="flex gap-1.5">
        {onFix && finding.suggestion && (
          <Button size="sm" variant="outline" className="h-6 text-xs px-2"
            onClick={() => onFix(finding)}
          >
            Fix
          </Button>
        )}
        <Button size="sm" variant="ghost" className="h-6 text-xs px-2"
          onClick={() => onIgnore(finding.id)}
          aria-label="Ignore"
        >
          Ignore
        </Button>
      </div>
    </div>
  )
}
