'use client'

import type { GeneratedSystem } from '@/lib/color/types'
import type { PreviewMode } from '@/lib/store/uiStore'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}

export function SystemPreview({ system, previewMode }: { system: GeneratedSystem; previewMode: PreviewMode }) {
  const r = system.roles ?? {}
  const isDark = previewMode === 'dark'

  const primary = r.primary?.hex ?? '#6366f1'
  const bg      = isDark ? '#0f0f0f' : (r.background?.hex ?? '#ffffff')
  const surface = isDark ? '#1c1c1c' : (r.surface?.hex ?? '#f9fafb')
  const text    = isDark ? '#f0f0f0' : (r.text?.hex ?? '#111827')
  const textSub = isDark ? '#a3a3a3' : (r.neutral?.hex ?? '#6b7280')
  const textDis = isDark ? '#525252' : (r.disabled?.hex ?? '#9ca3af')
  const border  = isDark ? '#2a2a2a' : (r.border?.hex ?? '#e5e7eb')
  const success = r.success?.hex ?? '#22c55e'
  const warning = r.warning?.hex ?? '#eab308'
  const error   = r.error?.hex ?? '#ef4444'
  const info    = r.info?.hex ?? '#3b82f6'

  return (
    <div className="space-y-6 p-3" style={{ backgroundColor: bg, color: text }} data-testid="system-preview">

      <Section title="Buttons">
        <div className="flex flex-wrap gap-2">
          <button style={{ backgroundColor: primary, color: '#fff' }}
            className="rounded-md px-3 py-1.5 text-sm font-medium">Primary</button>
          <button style={{ backgroundColor: 'transparent', color: primary, borderColor: primary }}
            className="rounded-md border px-3 py-1.5 text-sm font-medium">Outline</button>
          <button style={{ backgroundColor: surface, color: textDis }}
            className="rounded-md px-3 py-1.5 text-sm cursor-not-allowed">Disabled</button>
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-1">
          <p style={{ color: text }}    className="text-base font-semibold">Heading text</p>
          <p style={{ color: text }}    className="text-sm">Body text — primary</p>
          <p style={{ color: textSub }} className="text-sm">Secondary text</p>
          <p style={{ color: textDis }} className="text-sm">Disabled / placeholder</p>
        </div>
      </Section>

      <Section title="Card">
        <div className="rounded-lg border p-4 space-y-2"
          style={{ backgroundColor: surface, borderColor: border }}>
          <p style={{ color: text }}    className="text-sm font-medium">Card title</p>
          <p style={{ color: textSub }} className="text-xs">Card description text with secondary color.</p>
          <button style={{ backgroundColor: primary, color: '#fff' }}
            className="mt-1 rounded-md px-3 py-1 text-xs font-medium">Action</button>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          {([['Success', success], ['Warning', warning], ['Error', error], ['Info', info]] as [string, string][]).map(
            ([label, color]) => (
              <span key={label}
                style={{ backgroundColor: `${color}22`, color, borderColor: `${color}66` }}
                className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                {label}
              </span>
            ),
          )}
        </div>
      </Section>

      <Section title="Alerts">
        {([['Error', error], ['Warning', warning], ['Success', success], ['Info', info]] as [string, string][]).map(
          ([label, color]) => (
            <div key={label}
              style={{ backgroundColor: `${color}15`, borderColor: color, color }}
              className="flex items-center gap-2 rounded-md border-l-4 px-3 py-2">
              <span className="text-xs font-medium">{label}:</span>
              <span className="text-xs" style={{ color: text }}>Sample {label.toLowerCase()} message</span>
            </div>
          ),
        )}
      </Section>

      <Section title="Form Input">
        <div className="space-y-1.5">
          <label style={{ color: text }} className="text-xs font-medium">Label</label>
          <input readOnly value="Input value"
            style={{ backgroundColor: bg, borderColor: border, color: text }}
            className="w-full rounded-md border px-3 py-1.5 text-sm outline-none" />
          <input readOnly value="Error state"
            style={{ backgroundColor: bg, borderColor: error, color: text }}
            className="w-full rounded-md border px-3 py-1.5 text-sm outline-none" />
          <p style={{ color: error }} className="text-xs">This field has an error</p>
        </div>
      </Section>

    </div>
  )
}
