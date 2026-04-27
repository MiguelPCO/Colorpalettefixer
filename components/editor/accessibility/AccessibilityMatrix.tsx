'use client'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { ContrastCell } from './ContrastCell'
import type { Role } from '@/lib/color/types'

// Use actual Role values — text roles vs background roles
const TEXT_ROLES: Role[] = ['text', 'neutral', 'disabled']
const BG_ROLES: Role[]   = ['background', 'surface']

export function AccessibilityMatrix() {
  const system = usePaletteStore((s) => s.generatedSystem)

  if (!system) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-center text-sm text-muted-foreground">
          Run <strong>Analyze</strong> to see contrast pairs
        </p>
      </div>
    )
  }

  const textColors = TEXT_ROLES.map((r) => system.roles?.[r]).filter(Boolean) as NonNullable<typeof system.roles>[Role][]
  const bgColors   = BG_ROLES.map((r) => system.roles?.[r]).filter(Boolean) as NonNullable<typeof system.roles>[Role][]

  return (
    <div className="p-3 space-y-4 overflow-auto">
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Tier 1 — Text on Backgrounds
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
                  const report = system.contrastMatrix?.[key]
                  return report ? (
                    <ContrastCell key={key} foreground={fg} background={bg} report={report} />
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
