"use client"

import { cn } from '@/lib/utils'
import { AlertTriangle, Info, XCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Finding } from '@/lib/color/types'
import { FINDING_TIPS } from '@/lib/color/diagnostics/tips'
import { oklchToHex } from '@/lib/color/oklch/format'

const SEVERITY_STYLES = {
  critical: 'border-l-destructive bg-destructive/5',
  warning: 'border-l-yellow-500 bg-yellow-500/5',
  info: 'border-l-blue-500 bg-blue-500/5',
} as const

const SEVERITY_BADGE_STYLES = {
  critical: 'bg-red-600 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white',
} as const

const SEVERITY_ICONS = {
  critical: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const

interface FindingCardProps {
  finding: Finding
  isOpen: boolean
  onToggle: () => void
  onIgnore: (id: string) => void
  onFix?: (finding: Finding) => void
  currentHex?: string
}

export function FindingCard({ finding, isOpen, onToggle, onIgnore, onFix, currentHex }: FindingCardProps) {
  const Icon = SEVERITY_ICONS[finding.severity]
  const tip = FINDING_TIPS[finding.type]

  return (
    <div className={cn('rounded-md border-l-4', SEVERITY_STYLES[finding.severity])}>
      <button
        className="flex w-full items-center gap-2 p-3 text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 min-w-0 text-xs font-medium truncate">
          {finding.rule}
        </span>
        <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold', SEVERITY_BADGE_STYLES[finding.severity])}>
          {finding.severity}
        </span>
        {isOpen
          ? <ChevronUp className="h-3 w-3 text-muted-foreground shrink-0" />
          : <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
        }
      </button>

      {isOpen && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-xs text-muted-foreground">{finding.explanation}</p>

          <div className="rounded bg-muted/50 px-2.5 py-2 border-l-2 border-blue-500">
            <p className="text-[10px] font-semibold text-blue-500 mb-0.5">How to fix</p>
            <p className="text-xs text-muted-foreground">{tip.tip}</p>
          </div>

          <a
            href={tip.wcagUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {finding.rule}
            <ExternalLink className="h-2.5 w-2.5" />
          </a>

          {finding.suggestion && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-0.5">
                <div
                  className="h-6 w-6 rounded border border-border"
                  style={{ backgroundColor: currentHex ?? '#888' }}
                />
                <span className="text-[9px] text-muted-foreground">Before</span>
              </div>
              <span className="text-xs text-muted-foreground">→</span>
              <div className="flex flex-col items-center gap-0.5">
                <div
                  className="h-6 w-6 rounded border border-border"
                  style={{ backgroundColor: oklchToHex(finding.suggestion.newOklch) }}
                />
                <span className="text-[9px] text-muted-foreground">After</span>
              </div>
            </div>
          )}

          <div className="flex gap-1.5">
            {onFix && finding.suggestion && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs px-2"
                onClick={() => onFix(finding)}
              >
                Fix
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs px-2"
              onClick={() => onIgnore(finding.id)}
              aria-label="Ignore"
            >
              Ignore
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
