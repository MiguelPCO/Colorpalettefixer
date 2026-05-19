import { cn } from '@/lib/utils'
import type { ContrastMatrixEntry } from '@/lib/color/types'
import type { ContrastMode, MatrixTier, MatrixFontSize, MatrixWeight } from '@/lib/store/uiStore'

const WCAG_LEVEL_STYLES: Record<ContrastMatrixEntry['wcagLevel'], string> = {
  AAA: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  AA:  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  AA_LARGE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  FAIL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const APCA_BADGE_STYLES: Record<'pass' | 'warn' | 'fail', string> = {
  pass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  warn: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  fail: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

function apcaBadge(absLc: number, tier: MatrixTier): 'pass' | 'warn' | 'fail' {
  if (tier === 'AAA') {
    if (absLc >= 75) return 'pass'
    if (absLc >= 60) return 'warn'
    return 'fail'
  }
  if (absLc >= 60) return 'pass'
  if (absLc >= 45) return 'warn'
  return 'fail'
}

const LARGE_LEVEL_UPGRADE: Record<ContrastMatrixEntry['wcagLevel'], ContrastMatrixEntry['wcagLevel']> = {
  AAA:      'AAA',
  AA:       'AAA',
  AA_LARGE: 'AA',
  FAIL:     'FAIL',
}

interface ContrastCellProps {
  foreground: { hex: string }
  background: { hex: string }
  report: ContrastMatrixEntry
  contrastMode: ContrastMode
  matrixTier: MatrixTier
  matrixFontSize: MatrixFontSize
  matrixWeight: MatrixWeight
}

export function ContrastCell({ foreground, background, report, contrastMode, matrixTier, matrixFontSize, matrixWeight }: ContrastCellProps) {
  const cellStyle = { backgroundColor: background.hex, color: foreground.hex }
  const sampleCls = cn(
    matrixFontSize === 'large' ? 'text-base' : 'text-sm',
    matrixWeight === 'bold' ? 'font-bold' : 'font-normal',
  )

  if (contrastMode === 'APCA') {
    const absLc = Math.abs(report.apca)
    const badge = apcaBadge(absLc, matrixTier)
    return (
      <div
        className="flex flex-col items-center justify-center gap-1 rounded-md border border-border p-2 min-h-[72px]"
        style={cellStyle}
      >
        <span className={sampleCls}>Aa</span>
        <span className="text-xs">Lc {absLc.toFixed(1)}</span>
        <span className={cn('rounded px-1 py-0.5 text-[10px] font-semibold', APCA_BADGE_STYLES[badge])}>
          {badge === 'pass' ? 'Pass' : badge === 'warn' ? 'Warn' : 'Fail'}
        </span>
      </div>
    )
  }

  const displayLevel = matrixFontSize === 'large' ? LARGE_LEVEL_UPGRADE[report.wcagLevel] : report.wcagLevel
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 rounded-md border border-border p-2 min-h-[72px]"
      style={cellStyle}
    >
      <span className={sampleCls}>Aa</span>
      <span className="text-xs">{report.wcag.toFixed(1)}:1</span>
      <span className={cn('rounded px-1 py-0.5 text-[10px] font-semibold', WCAG_LEVEL_STYLES[displayLevel])}>
        {displayLevel === 'AA_LARGE' ? 'AA lg' : displayLevel}
      </span>
    </div>
  )
}
