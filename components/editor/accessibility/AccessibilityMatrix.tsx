'use client'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'
import { ContrastCell } from './ContrastCell'
import { simulateCvd } from '@/lib/color/cvd/simulate'
import { wcagContrast } from '@/lib/color/contrast/wcag'
import { apcaContrast, apcaPolarity } from '@/lib/color/contrast/apca'
import type { Role, Color, ContrastMatrixEntry } from '@/lib/color/types'
import type { CvdMode, MatrixFontSize, MatrixWeight } from '@/lib/store/uiStore'

const TEXT_ROLES: Role[] = ['text', 'neutral', 'disabled']
const BG_ROLES: Role[]   = ['background', 'surface']

const activeBtn = 'rounded px-2 py-0.5 text-xs font-semibold bg-foreground text-background'
const inactiveBtn = 'rounded px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground'

function simulateReport(fg: Color, bg: Color, cvdMode: Exclude<CvdMode, 'none'>): ContrastMatrixEntry {
  const simFg = simulateCvd(fg.rgb, cvdMode)
  const simBg = simulateCvd(bg.rgb, cvdMode)
  const wcag = wcagContrast(simFg, simBg)
  const lc = apcaContrast(simFg, simBg)
  const wcagLevel: ContrastMatrixEntry['wcagLevel'] =
    wcag >= 7 ? 'AAA' : wcag >= 4.5 ? 'AA' : wcag >= 3 ? 'AA_LARGE' : 'FAIL'
  return { wcag, apca: lc, wcagLevel, apcaPolarity: apcaPolarity(lc) }
}

const CVD_LABELS: { mode: CvdMode; label: string }[] = [
  { mode: 'none', label: 'Normal' },
  { mode: 'deuteranopia', label: 'Deutan' },
  { mode: 'protanopia', label: 'Protan' },
  { mode: 'tritanopia', label: 'Tritan' },
]

export function AccessibilityMatrix() {
  const system          = usePaletteStore((s) => s.generatedSystem)
  const contrastMode    = useUIStore((s) => s.contrastMode)
  const setContrastMode = useUIStore((s) => s.setContrastMode)
  const matrixTier      = useUIStore((s) => s.matrixTier)
  const setMatrixTier   = useUIStore((s) => s.setMatrixTier)
  const cvdMode         = useUIStore((s) => s.cvdMode)
  const setCvdMode      = useUIStore((s) => s.setCvdMode)
  const matrixFontSize  = useUIStore((s) => s.matrixFontSize)
  const setMatrixFontSize = useUIStore((s) => s.setMatrixFontSize)
  const matrixWeight    = useUIStore((s) => s.matrixWeight)
  const setMatrixWeight = useUIStore((s) => s.setMatrixWeight)

  if (!system) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-center text-sm text-muted-foreground">
          Run <strong>Analyze</strong> to see contrast pairs
        </p>
      </div>
    )
  }

  const textColors = TEXT_ROLES.map((r) => system.roles?.[r]).filter(Boolean) as Color[]
  const bgColors   = BG_ROLES.map((r) => system.roles?.[r]).filter(Boolean) as Color[]

  return (
    <div className="p-3 space-y-4 overflow-auto">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-md border border-border p-0.5">
          <button className={contrastMode === 'WCAG' ? activeBtn : inactiveBtn} onClick={() => setContrastMode('WCAG')}>WCAG</button>
          <button className={contrastMode === 'APCA' ? activeBtn : inactiveBtn} onClick={() => setContrastMode('APCA')}>APCA</button>
        </div>
        <div className="flex gap-1 rounded-md border border-border p-0.5">
          <button className={matrixTier === 'AA' ? activeBtn : inactiveBtn} onClick={() => setMatrixTier('AA')}>AA</button>
          <button className={matrixTier === 'AAA' ? activeBtn : inactiveBtn} onClick={() => setMatrixTier('AAA')}>AAA</button>
        </div>
        <div className="flex gap-1 rounded-md border border-border p-0.5">
          {CVD_LABELS.map(({ mode, label }) => (
            <button key={mode} className={cvdMode === mode ? activeBtn : inactiveBtn} onClick={() => setCvdMode(mode)}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-md border border-border p-0.5">
          <button className={matrixFontSize === 'normal' ? activeBtn : inactiveBtn} onClick={() => setMatrixFontSize('normal')}>Normal</button>
          <button className={matrixFontSize === 'large' ? activeBtn : inactiveBtn} onClick={() => setMatrixFontSize('large')}>Large</button>
        </div>
        <div className="flex gap-1 rounded-md border border-border p-0.5">
          <button className={matrixWeight === 'normal' ? activeBtn : inactiveBtn} onClick={() => setMatrixWeight('normal')}>Regular</button>
          <button className={matrixWeight === 'bold' ? activeBtn : inactiveBtn} onClick={() => setMatrixWeight('bold')}>Bold</button>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {contrastMode} — Tier {matrixTier} · Text on Backgrounds
          {cvdMode !== 'none' && (
            <span className="ml-1 normal-case font-normal opacity-70">· {cvdMode} (sim)</span>
          )}
        </h3>
        {textColors.length === 0 || bgColors.length === 0 ? (
          <p className="text-xs text-muted-foreground">No text/background roles assigned yet.</p>
        ) : (
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `80px repeat(${bgColors.length}, 1fr)` }}
          >
            <div />
            {bgColors.map((bg) => bg && (
              <div key={bg.id} className="text-center">
                <span className="mx-auto block h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: bg.hex }} />
                <span className="font-mono text-[10px]">{bg.hex}</span>
              </div>
            ))}
            {textColors.map((fg) => fg && (
              <>
                <div key={`row-${fg.id}`} className="flex items-center">
                  <span className="mr-1 h-4 w-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: fg.hex }} />
                  <span className="font-mono text-[10px]">{fg.hex}</span>
                </div>
                {bgColors.map((bg) => {
                  if (!bg) return null
                  const key = `${fg.id}:${bg.id}`
                  const report = cvdMode === 'none'
                    ? system.contrastMatrix?.[key]
                    : simulateReport(fg, bg, cvdMode)
                  return report ? (
                    <ContrastCell
                      key={key}
                      foreground={fg}
                      background={bg}
                      report={report}
                      contrastMode={contrastMode}
                      matrixTier={matrixTier}
                      matrixFontSize={matrixFontSize}
                      matrixWeight={matrixWeight}
                    />
                  ) : (
                    <div key={key} className="rounded-md border border-dashed border-border p-2 text-center text-xs text-muted-foreground">—</div>
                  )
                })}
              </>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
