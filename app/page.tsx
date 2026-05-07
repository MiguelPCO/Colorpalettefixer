import Link from 'next/link'

const FEATURES = [
  { title: 'WCAG 2.2 & APCA', desc: 'Contrast analysis for every color pair with AA/AAA classification' },
  { title: 'Role Assignment', desc: 'Auto-assign primary, neutral, semantic roles via fitness scoring' },
  { title: 'Design Tokens', desc: 'Export to CSS, Tailwind v4, DTCG W3C, SCSS, Style Dictionary' },
  { title: 'CVD Simulation', desc: 'Preview your palette under deuteranopia, protanopia, tritanopia' },
  { title: 'Fix Suggestions', desc: 'One-click fixes for contrast failures — minimal delta, hue preserved' },
  { title: 'Undo / Redo', desc: '50-step history with Cmd+Z / Cmd+Shift+Z, autosaved to IndexedDB' },
]

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 py-20">
      <div className="max-w-2xl w-full space-y-12">

        <div className="space-y-4 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground border border-border rounded-full px-3 py-1">
            OKLCH · WCAG 2.2 · APCA · CVD
          </span>
          <h1 className="text-5xl font-bold tracking-tight">
            Color<span className="text-[oklch(0.50_0.22_258)]">Fixer</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Professional color palette analyzer for designers and engineers.
            Find issues, assign roles, export tokens.
          </p>
        </div>

        <div className="flex justify-center">
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 bg-[oklch(0.50_0.22_258)] text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
          >
            Open Editor →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-lg border border-border p-4 space-y-1 bg-background">
              <h3 className="text-sm font-medium">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Free for palettes up to 16 colors · No account required
        </p>
      </div>
    </div>
  )
}
