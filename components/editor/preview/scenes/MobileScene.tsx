import type { GeneratedSystem } from '@/lib/color/types'
import type { PreviewMode } from '@/lib/store/uiStore'

interface Props {
  system: GeneratedSystem
  previewMode: PreviewMode
}

export function MobileScene({ system, previewMode }: Props) {
  const r = system.roles ?? {}
  const isDark = previewMode === 'dark'

  const primary = r.primary?.hex ?? '#6366f1'
  const bg      = isDark ? '#0f0f0f' : (r.background?.hex ?? '#ffffff')
  const surface = isDark ? '#1c1c1c' : (r.surface?.hex ?? '#f9fafb')
  const text    = isDark ? '#f0f0f0' : (r.text?.hex ?? '#111827')
  const textSub = isDark ? '#a3a3a3' : (r.neutral?.hex ?? '#6b7280')
  const border  = isDark ? '#2a2a2a' : (r.border?.hex ?? '#e5e7eb')

  const tabs = ['Home', 'Search', 'Profile', 'Settings']

  return (
    <div data-testid="mobile-scene"
      className="flex items-center justify-center py-6"
      style={{ backgroundColor: isDark ? '#1a1a1a' : '#f0f4f8' }}>
      {/* Phone frame */}
      <div className="relative overflow-hidden shadow-2xl"
        style={{
          width: 240,
          height: 460,
          borderRadius: 28,
          backgroundColor: bg,
          border: `6px solid ${isDark ? '#333' : '#e2e8f0'}`,
        }}>
        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-1.5"
          style={{ backgroundColor: primary }}>
          <span className="text-[9px] font-semibold text-white">9:41</span>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-3.5 rounded-sm bg-white/70" />
            <div className="h-1.5 w-1.5 rounded-sm bg-white/70" />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3"
          style={{ backgroundColor: primary }}>
          <span className="text-xs text-white/70">←</span>
          <span className="text-sm font-semibold text-white">My App</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden px-3 py-3 space-y-2"
          style={{ backgroundColor: bg }}>
          {[
            { title: 'Recent Activity', sub: '3 new updates today' },
            { title: 'Your Balance', sub: '$1,248.50' },
            { title: 'Quick Actions', sub: 'Transfer · Pay · Invest' },
          ].map(({ title, sub }) => (
            <div key={title}
              className="rounded-xl p-3"
              style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold" style={{ color: text }}>{title}</p>
              <p className="text-[10px] mt-0.5" style={{ color: textSub }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Bottom tab bar */}
        <div className="absolute bottom-0 left-0 right-0 flex border-t"
          style={{ backgroundColor: surface, borderColor: border }}>
          {tabs.map((tab, i) => (
            <button key={tab}
              className="flex flex-1 flex-col items-center gap-0.5 py-2">
              <div className="h-4 w-4 rounded-sm"
                style={{ backgroundColor: i === 0 ? primary : textSub, opacity: i === 0 ? 1 : 0.4 }} />
              <span className="text-[8px] font-medium"
                style={{ color: i === 0 ? primary : textSub }}>
                {tab}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
