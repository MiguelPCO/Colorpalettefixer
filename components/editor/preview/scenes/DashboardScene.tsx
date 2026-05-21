import type { GeneratedSystem } from '@/lib/color/types'
import type { PreviewMode } from '@/lib/store/uiStore'

interface Props {
  system: GeneratedSystem
  previewMode: PreviewMode
}

export function DashboardScene({ system, previewMode }: Props) {
  const r = system.roles ?? {}
  const isDark = previewMode === 'dark'

  const primary = r.primary?.hex ?? '#6366f1'
  const bg      = isDark ? '#0f0f0f' : (r.background?.hex ?? '#ffffff')
  const surface = isDark ? '#1c1c1c' : (r.surface?.hex ?? '#f9fafb')
  const sidebar = isDark ? '#141414' : (r.surface?.hex ?? '#f1f5f9')
  const text    = isDark ? '#f0f0f0' : (r.text?.hex ?? '#111827')
  const textSub = isDark ? '#a3a3a3' : (r.neutral?.hex ?? '#6b7280')
  const border  = isDark ? '#2a2a2a' : (r.border?.hex ?? '#e5e7eb')
  const success = r.success?.hex ?? '#22c55e'
  const warning = r.warning?.hex ?? '#eab308'
  const error   = r.error?.hex ?? '#ef4444'
  const info    = r.info?.hex ?? '#3b82f6'

  const statCards = [
    { label: 'Revenue', value: '$24,500', delta: '+12%', color: success },
    { label: 'Users', value: '1,240', delta: '+8%', color: info },
    { label: 'Bounces', value: '32%', delta: '+3%', color: warning },
    { label: 'Errors', value: '5', delta: '-2', color: error },
  ]

  const tableRows = [
    { name: 'Alice Johnson', status: 'Active', color: success },
    { name: 'Bob Martinez', status: 'Pending', color: warning },
    { name: 'Carol Smith', status: 'Inactive', color: error },
    { name: 'David Lee', status: 'Active', color: success },
  ]

  return (
    <div data-testid="dashboard-scene"
      className="flex h-full"
      style={{ backgroundColor: bg, color: text }}>
      {/* Sidebar */}
      <aside className="flex w-40 shrink-0 flex-col gap-1 border-r p-3"
        style={{ backgroundColor: sidebar, borderColor: border }}>
        <div className="mb-3 flex items-center gap-2">
          <div className="h-5 w-5 rounded" style={{ backgroundColor: primary }} />
          <span className="text-sm font-bold" style={{ color: text }}>App</span>
        </div>
        {['Dashboard', 'Analytics', 'Users', 'Settings'].map((item, i) => (
          <div key={item}
            className="flex items-center gap-2 rounded-md px-2 py-1.5"
            style={{
              backgroundColor: i === 0 ? `${primary}22` : 'transparent',
              color: i === 0 ? primary : textSub,
            }}>
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: i === 0 ? primary : textSub, opacity: 0.6 }} />
            <span className="text-xs font-medium">{item}</span>
          </div>
        ))}
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b px-4 py-2.5"
          style={{ backgroundColor: surface, borderColor: border }}>
          <span className="text-sm font-semibold" style={{ color: text }}>Dashboard</span>
          <div className="h-7 w-7 rounded-full" style={{ backgroundColor: `${primary}44` }} />
        </header>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-3">
            {statCards.map(({ label, value, delta, color }) => (
              <div key={label}
                className="rounded-lg border p-3 space-y-1"
                style={{ backgroundColor: surface, borderColor: `${color}44` }}>
                <p className="text-xs" style={{ color: textSub }}>{label}</p>
                <p className="text-lg font-bold" style={{ color: text }}>{value}</p>
                <span className="text-[10px] font-semibold rounded-full px-1.5 py-0.5"
                  style={{ backgroundColor: `${color}22`, color }}>
                  {delta}
                </span>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden"
            style={{ backgroundColor: surface, borderColor: border }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  <th className="px-4 py-2 text-left font-semibold" style={{ color: textSub }}>Name</th>
                  <th className="px-4 py-2 text-left font-semibold" style={{ color: textSub }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(({ name, status, color }) => (
                  <tr key={name} style={{ borderBottom: `1px solid ${border}` }}>
                    <td className="px-4 py-2" style={{ color: text }}>{name}</td>
                    <td className="px-4 py-2">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: `${color}22`, color }}>
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
