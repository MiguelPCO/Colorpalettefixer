import type { GeneratedSystem } from '@/lib/color/types'
import type { PreviewMode } from '@/lib/store/uiStore'

interface Props {
  system: GeneratedSystem
  previewMode: PreviewMode
}

export function LandingScene({ system, previewMode }: Props) {
  const r = system.roles ?? {}
  const isDark = previewMode === 'dark'

  const primary = r.primary?.hex ?? '#6366f1'
  const bg      = isDark ? '#0f0f0f' : (r.background?.hex ?? '#ffffff')
  const surface = isDark ? '#1c1c1c' : (r.surface?.hex ?? '#f9fafb')
  const text    = isDark ? '#f0f0f0' : (r.text?.hex ?? '#111827')
  const textSub = isDark ? '#a3a3a3' : (r.neutral?.hex ?? '#6b7280')
  const border  = isDark ? '#2a2a2a' : (r.border?.hex ?? '#e5e7eb')
  const success = r.success?.hex ?? '#22c55e'
  const warning = r.warning?.hex ?? '#eab308'

  return (
    <div data-testid="landing-scene" style={{ backgroundColor: bg, color: text }}>
      {/* Nav */}
      <nav style={{ backgroundColor: surface, borderBottom: `1px solid ${border}` }}
        className="flex items-center gap-4 px-6 py-3">
        <div className="h-5 w-5 rounded" style={{ backgroundColor: primary }} />
        <span className="text-sm font-bold" style={{ color: text }}>Brand</span>
        <div className="flex-1" />
        {['Features', 'Pricing', 'About'].map((link) => (
          <span key={link} className="text-sm" style={{ color: textSub }}>{link}</span>
        ))}
        <button className="rounded-md px-4 py-1.5 text-sm font-medium text-white"
          style={{ backgroundColor: primary }}>
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center gap-6 px-6 py-16 text-center"
        style={{ backgroundColor: bg }}>
        <h1 className="text-3xl font-bold leading-tight" style={{ color: text }}>
          Build something great
        </h1>
        <p className="max-w-md text-base" style={{ color: textSub }}>
          A subtitle that explains what the product does and why users should care.
        </p>
        <div className="flex gap-3">
          <button className="rounded-md px-5 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: primary }}>
            Start free
          </button>
          <button className="rounded-md border px-5 py-2 text-sm font-medium"
            style={{ borderColor: primary, color: primary, backgroundColor: 'transparent' }}>
            Learn more
          </button>
        </div>
      </div>

      {/* Features */}
      <div style={{ backgroundColor: surface, borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}
        className="grid grid-cols-3 gap-px">
        {[
          { label: 'Fast', desc: 'Sub-second response times at scale.', accent: primary },
          { label: 'Reliable', desc: '99.9% uptime SLA with redundant systems.', accent: success },
          { label: 'Secure', desc: 'SOC 2 Type II certified infrastructure.', accent: warning },
        ].map(({ label, desc, accent }) => (
          <div key={label} className="flex flex-col gap-3 p-6"
            style={{ backgroundColor: bg }}>
            <div className="h-8 w-8 rounded-md" style={{ backgroundColor: `${accent}22` }}>
              <div className="h-3 w-3 rounded-sm m-2.5" style={{ backgroundColor: accent }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: text }}>{label}</p>
            <p className="text-xs" style={{ color: textSub }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center"
        style={{ backgroundColor: isDark ? '#0a0a0a' : (r.text?.hex ?? '#111827') }}>
        <p className="text-xs" style={{ color: isDark ? '#555' : '#9ca3af' }}>
          © 2026 Brand Inc. All rights reserved.
        </p>
      </div>

    </div>
  )
}
