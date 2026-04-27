import { cn } from '@/lib/utils'
import type { ContrastMatrixEntry } from '@/lib/color/types'

const LEVEL_STYLES: Record<ContrastMatrixEntry['wcagLevel'], string> = {
  AAA: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  AA:  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  AA_LARGE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  FAIL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

interface ContrastCellProps {
  foreground: { hex: string }
  background: { hex: string }
  report: ContrastMatrixEntry
}

export function ContrastCell({ foreground, background, report }: ContrastCellProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 rounded-md border border-border p-2 min-h-[72px]"
      style={{ backgroundColor: background.hex, color: foreground.hex }}
    >
      <span className="text-sm font-bold">Aa</span>
      <span className="text-xs">{report.wcag.toFixed(1)}:1</span>
      <span className={cn('rounded px-1 py-0.5 text-[10px] font-semibold', LEVEL_STYLES[report.wcagLevel])}>
        {report.wcagLevel === 'AA_LARGE' ? 'AA lg' : report.wcagLevel}
      </span>
    </div>
  )
}
