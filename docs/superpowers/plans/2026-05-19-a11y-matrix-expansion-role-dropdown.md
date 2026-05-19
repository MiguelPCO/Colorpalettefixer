# A11y Matrix Expansion + Role Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the accessibility contrast matrix to cover all 14 semantic roles and add an inline role assignment dropdown to each color card in the MainCanvas.

**Architecture:** Shared constants file (`lib/color/roles/constants.ts`) provides `ALL_ROLES`, `MATRIX_FG_ROLES`, and `MATRIX_BG_ROLES`. The matrix builder in `page.tsx` and the renderer in `AccessibilityMatrix.tsx` both import from this single source. `MainCanvas.tsx` cards restructure from `<button>` to `<div>+<button>` to allow an inline `<select>` without invalid HTML nesting, reading/writing `generatedSystem.roles` in the palette store.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, Zustand v5, Vitest + React Testing Library, Tailwind v4

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `lib/color/roles/constants.ts` | Single source for `ALL_ROLES`, `MATRIX_FG_ROLES`, `MATRIX_BG_ROLES` |
| Modify | `components/editor/roles/RolesTab.tsx` | Remove local `ALL_ROLES`, import from constants |
| Modify | `app/editor/page.tsx` | Remove local `TEXT_ROLES`/`BG_ROLES`, import from constants |
| Modify | `components/editor/accessibility/AccessibilityMatrix.tsx` | Expand role arrays, add role labels to headers, add non-text legend |
| Modify | `components/editor/MainCanvas.tsx` | Add role `<select>`, restructure cards |
| Modify | `components/editor/__tests__/AccessibilityMatrix.test.tsx` | Add role-label test |
| Modify | `components/editor/__tests__/MainCanvas.test.tsx` | Update mocks, add role-select tests |

---

## Task 1: Create shared role constants

**Files:**
- Create: `lib/color/roles/constants.ts`

- [ ] **Step 1: Create the constants file**

```typescript
// lib/color/roles/constants.ts
import type { Role } from '../types'

export const ALL_ROLES: Role[] = [
  'primary', 'secondary', 'accent', 'neutral',
  'background', 'surface', 'border', 'text',
  'success', 'warning', 'error', 'info',
  'disabled', 'focus',
]

export const MATRIX_FG_ROLES: Role[] = [
  'text', 'primary', 'secondary', 'accent',
  'neutral', 'error', 'warning', 'success', 'info',
  'disabled', 'focus', 'border',
]

export const MATRIX_BG_ROLES: Role[] = [
  'background', 'surface', 'primary', 'secondary', 'accent',
]
```

- [ ] **Step 2: Verify TypeScript accepts the file**

Run: `cd D:\Miguel\Portfolio\miguel-dev-workspace\projects\Colorfixer\cpf && pnpm typecheck`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/color/roles/constants.ts
git commit -m "feat: add shared role constants (ALL_ROLES, MATRIX_FG_ROLES, MATRIX_BG_ROLES)"
```

---

## Task 2: Migrate RolesTab to use shared constants

**Files:**
- Modify: `components/editor/roles/RolesTab.tsx`

- [ ] **Step 1: Replace local ALL_ROLES in RolesTab**

Current top of `RolesTab.tsx`:
```typescript
'use client'
import { useCallback } from 'react'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { RoleSlot } from './RoleSlot'
import type { Role } from '@/lib/color/types'

// Use ONLY actual Role values from the Role type
const ALL_ROLES: Role[] = [
  'primary', 'secondary', 'accent', 'neutral',
  'background', 'surface', 'border', 'text',
  'success', 'warning', 'error', 'info',
  'disabled', 'focus',
]
```

Replace with:
```typescript
'use client'
import { useCallback } from 'react'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { ALL_ROLES } from '@/lib/color/roles/constants'
import { RoleSlot } from './RoleSlot'
import type { Role } from '@/lib/color/types'
```

- [ ] **Step 2: Run existing tests**

Run: `pnpm test --run`
Expected: all tests pass (no behavior change)

- [ ] **Step 3: Commit**

```bash
git add components/editor/roles/RolesTab.tsx
git commit -m "refactor: RolesTab imports ALL_ROLES from shared constants"
```

---

## Task 3: Migrate page.tsx to use shared constants

**Files:**
- Modify: `app/editor/page.tsx`

- [ ] **Step 1: Replace local role arrays in page.tsx**

Find these lines near the top of `app/editor/page.tsx` (around line 33–34):
```typescript
const TEXT_ROLES: Role[] = ['text', 'neutral', 'disabled']
const BG_ROLES: Role[] = ['background', 'surface']
```

Replace with an import (add to the import block at the top of the file):
```typescript
import { MATRIX_FG_ROLES, MATRIX_BG_ROLES } from '@/lib/color/roles/constants'
```

Then in the `handleAnalyze` callback (around line 143–146), rename usages:
```typescript
// Before:
for (const textRole of TEXT_ROLES) {
  // ...
  for (const bgRole of BG_ROLES) {

// After:
for (const textRole of MATRIX_FG_ROLES) {
  // ...
  for (const bgRole of MATRIX_BG_ROLES) {
```

- [ ] **Step 2: Run typecheck and tests**

Run: `pnpm typecheck && pnpm test --run`
Expected: no errors, all tests pass

- [ ] **Step 3: Commit**

```bash
git add app/editor/page.tsx
git commit -m "refactor: page.tsx imports MATRIX_FG_ROLES/MATRIX_BG_ROLES from constants"
```

---

## Task 4: Expand AccessibilityMatrix with role labels and full coverage

**Files:**
- Modify: `components/editor/accessibility/AccessibilityMatrix.tsx`
- Modify: `components/editor/__tests__/AccessibilityMatrix.test.tsx`

- [ ] **Step 1: Write the new failing test**

Add to `components/editor/__tests__/AccessibilityMatrix.test.tsx`:

```typescript
it('shows role name labels in matrix headers', () => {
  mockUIStore()
  vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
    sel({ generatedSystem: SYSTEM }),
  )
  render(<AccessibilityMatrix />)
  // Role name appears as text label in the matrix headers
  expect(screen.getByText('text')).toBeInTheDocument()
  expect(screen.getByText('background')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `pnpm test --run AccessibilityMatrix`
Expected: FAIL — "text" and "background" role labels not yet rendered in headers

- [ ] **Step 3: Rewrite AccessibilityMatrix.tsx**

Replace the entire file content with:

```typescript
'use client'
import React from 'react'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'
import { ContrastCell } from './ContrastCell'
import { simulateCvd } from '@/lib/color/cvd/simulate'
import { wcagContrast } from '@/lib/color/contrast/wcag'
import { apcaContrast, apcaPolarity } from '@/lib/color/contrast/apca'
import { MATRIX_FG_ROLES, MATRIX_BG_ROLES } from '@/lib/color/roles/constants'
import type { Role, Color, ContrastMatrixEntry } from '@/lib/color/types'
import type { CvdMode, MatrixFontSize, MatrixWeight } from '@/lib/store/uiStore'

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

function extractPairs(
  roles: Partial<Record<Role, Color | null>> | undefined,
  roleList: Role[],
): { role: Role; color: Color }[] {
  return Array.from(
    new Map(
      roleList
        .map(r => (roles?.[r] ? { role: r, color: roles[r] as Color } : null))
        .filter((p): p is { role: Role; color: Color } => p !== null)
        .map(p => [p.color.id, p]),
    ).values(),
  )
}

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

  const fgPairs = extractPairs(system.roles, MATRIX_FG_ROLES)
  const bgPairs = extractPairs(system.roles, MATRIX_BG_ROLES)

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
          {contrastMode} — Tier {matrixTier} · Role Contrast
          {cvdMode !== 'none' && (
            <span className="ml-1 normal-case font-normal opacity-70">· {cvdMode} (sim)</span>
          )}
        </h3>
        {fgPairs.length === 0 || bgPairs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No roles assigned yet — run Analyze first.</p>
        ) : (
          <>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `96px repeat(${bgPairs.length}, 1fr)` }}
            >
              {/* Empty top-left cell */}
              <div />
              {/* BG column headers */}
              {bgPairs.map(({ role, color }) => (
                <div key={color.id} className="text-center">
                  <span className="mx-auto block h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                  <span className="block text-[10px] font-medium capitalize">{role}</span>
                  <span className="block font-mono text-[10px] text-muted-foreground">{color.hex}</span>
                </div>
              ))}
              {/* FG rows */}
              {fgPairs.map(({ role, color }) => (
                <React.Fragment key={color.id}>
                  <div className="flex items-center gap-1">
                    <span className="h-4 w-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: color.hex }} />
                    <div className="min-w-0">
                      <span className="block text-[10px] font-medium capitalize">{role}</span>
                      <span className="block font-mono text-[10px] text-muted-foreground truncate">{color.hex}</span>
                    </div>
                  </div>
                  {bgPairs.map(({ color: bg }) => {
                    const key = `${color.id}:${bg.id}`
                    const report = cvdMode === 'none'
                      ? system.contrastMatrix?.[key]
                      : simulateReport(color, bg, cvdMode)
                    return report ? (
                      <ContrastCell
                        key={key}
                        foreground={color}
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
                </React.Fragment>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground">
              * border and focus roles use 3:1 non-text threshold (AA_LARGE)
            </p>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm test --run AccessibilityMatrix`
Expected: all tests pass including the new role-label test

- [ ] **Step 5: Run full test suite**

Run: `pnpm test --run`
Expected: all tests pass

- [ ] **Step 6: Commit**

```bash
git add components/editor/accessibility/AccessibilityMatrix.tsx components/editor/__tests__/AccessibilityMatrix.test.tsx
git commit -m "feat: expand a11y matrix to all 14 roles with role name labels"
```

---

## Task 5: Role dropdown on MainCanvas color cards

**Files:**
- Modify: `components/editor/MainCanvas.tsx`
- Modify: `components/editor/__tests__/MainCanvas.test.tsx`

- [ ] **Step 1: Write failing tests**

Replace the content of `components/editor/__tests__/MainCanvas.test.tsx` with:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MainCanvas } from '../MainCanvas'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'
import type { Color, GeneratedSystem } from '@/lib/color/types'

vi.mock('@/lib/store/paletteStore', () => ({ usePaletteStore: vi.fn() }))
vi.mock('@/lib/store/uiStore', () => ({ useUIStore: vi.fn() }))

const C: Color = {
  id: 'c1',
  hex: '#3b82f6',
  oklch: { l: 0.6, c: 0.2, h: 264 },
  rgb: { r: 59, g: 130, b: 246 },
  inGamutSrgb: true,
}

const makeSystem = (roles: Record<string, Color> = {}): GeneratedSystem => ({
  brand: {} as any, neutral: {} as any, success: {} as any,
  warning: {} as any, error: {} as any, info: {} as any,
  roles,
})

const mockStores = (
  colors: Color[] = [C],
  isAnalyzing = false,
  generatedSystem: GeneratedSystem | null = null,
) => {
  const setGeneratedSystem = vi.fn()
  vi.mocked(usePaletteStore).mockImplementation((sel: any) =>
    sel({ colors, isAnalyzing, setIsAnalyzing: vi.fn(), generatedSystem, setGeneratedSystem }),
  )
  vi.mocked(useUIStore).mockImplementation((sel: any) =>
    sel({ selectedColorId: null, selectColor: vi.fn() }),
  )
  return { setGeneratedSystem }
}

describe('MainCanvas', () => {
  it('renders color cards for each palette color', () => {
    mockStores()
    render(<MainCanvas onAnalyze={vi.fn()} />)
    expect(screen.getByText('#3b82f6')).toBeInTheDocument()
  })

  it('analyze button calls onAnalyze', () => {
    const onAnalyze = vi.fn()
    const colors: Color[] = [
      C,
      { ...C, id: 'c2', hex: '#ef4444', oklch: { l: 0.5, c: 0.25, h: 25 }, rgb: { r: 239, g: 68, b: 68 } },
    ]
    mockStores(colors)
    render(<MainCanvas onAnalyze={onAnalyze} />)
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }))
    expect(onAnalyze).toHaveBeenCalled()
  })

  it('shows spinner while analyzing', () => {
    mockStores([C], true)
    render(<MainCanvas onAnalyze={vi.fn()} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('role select is disabled before analyze', () => {
    mockStores([C], false, null)
    render(<MainCanvas onAnalyze={vi.fn()} />)
    const selects = screen.getAllByRole('combobox')
    expect(selects[0]).toBeDisabled()
  })

  it('role select shows current role when assigned', () => {
    mockStores([C], false, makeSystem({ primary: C }))
    render(<MainCanvas onAnalyze={vi.fn()} />)
    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('primary')
  })

  it('changing role calls setGeneratedSystem with updated roles', () => {
    const system = makeSystem({})
    const { setGeneratedSystem } = mockStores([C], false, system)
    render(<MainCanvas onAnalyze={vi.fn()} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'primary' } })
    expect(setGeneratedSystem).toHaveBeenCalledWith(
      expect.objectContaining({
        roles: expect.objectContaining({ primary: C }),
      }),
    )
  })

  it('changing role unassigns color from its previous role', () => {
    const system = makeSystem({ secondary: C })
    const { setGeneratedSystem } = mockStores([C], false, system)
    render(<MainCanvas onAnalyze={vi.fn()} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'primary' } })
    const call = setGeneratedSystem.mock.calls[0][0]
    expect(call.roles.primary).toEqual(C)
    expect(call.roles.secondary).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run tests to confirm failures**

Run: `pnpm test --run MainCanvas`
Expected: the 4 new role-select tests FAIL (component doesn't have select yet)

- [ ] **Step 3: Rewrite MainCanvas.tsx**

Replace the entire file with:

```typescript
import { useMemo, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { useUIStore } from '@/lib/store/uiStore'
import { detectHarmony } from '@/lib/color/harmony/detect'
import { Button } from '@/components/ui/button'
import { ALL_ROLES } from '@/lib/color/roles/constants'
import { cn } from '@/lib/utils'
import type { Color, GeneratedSystem, Role } from '@/lib/color/types'

interface MainCanvasProps {
  onAnalyze: () => void
}

function currentRole(system: GeneratedSystem | null, colorId: string): Role | null {
  if (!system?.roles) return null
  for (const [role, color] of Object.entries(system.roles)) {
    if (color?.id === colorId) return role as Role
  }
  return null
}

export function MainCanvas({ onAnalyze }: MainCanvasProps) {
  const colors             = usePaletteStore((s) => s.colors)
  const isAnalyzing        = usePaletteStore((s) => s.isAnalyzing)
  const generatedSystem    = usePaletteStore((s) => s.generatedSystem)
  const setGeneratedSystem = usePaletteStore((s) => s.setGeneratedSystem)
  const selectedColorId    = useUIStore((s) => s.selectedColorId)
  const selectColor        = useUIStore((s) => s.selectColor)

  const harmony = useMemo(
    () => (colors.length >= 2 ? detectHarmony(colors.map((c) => c.oklch)) : null),
    [colors],
  )

  const handleRoleChange = useCallback(
    (colorId: string, newRole: Role | '') => {
      if (!generatedSystem) return
      const color = colors.find((c) => c.id === colorId)
      if (!color) return
      const updatedRoles = { ...generatedSystem.roles }
      for (const r of Object.keys(updatedRoles) as Role[]) {
        if (updatedRoles[r]?.id === colorId) delete updatedRoles[r]
      }
      if (newRole) updatedRoles[newRole as Role] = color
      setGeneratedSystem({ ...generatedSystem, roles: updatedRoles })
    },
    [generatedSystem, colors, setGeneratedSystem],
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Color Grid</span>
          {harmony && harmony.confidence !== 'none' && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
              {harmony.template}
              <span className="ml-1 opacity-60">({harmony.confidence})</span>
            </span>
          )}
        </div>
        <Button
          size="sm"
          onClick={onAnalyze}
          disabled={isAnalyzing || colors.length < 2}
        >
          {isAnalyzing ? (
            <>
              <Loader2 role="status" className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Analyzing…
            </>
          ) : (
            'Analyze Palette'
          )}
        </Button>
      </div>

      {colors.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">Add at least 2 colors to start</p>
        </div>
      ) : (
        <div
          className="grid auto-rows-fr gap-3 p-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}
        >
          {colors.map((c) => (
            <div
              key={c.id}
              className={cn(
                'flex flex-col overflow-hidden rounded-lg border border-black/10 transition-shadow',
                c.id === selectedColorId && 'ring-2 ring-primary shadow-md',
              )}
            >
              <button
                className="block h-20 w-full cursor-pointer"
                style={{ backgroundColor: c.hex }}
                aria-label={`Select color ${c.hex}`}
                onClick={() => selectColor(c.id === selectedColorId ? null : c.id)}
              />
              <div className="bg-background px-2 py-1.5">
                <span className="block font-mono text-xs">{c.hex}</span>
                <span className={cn('block text-xs text-muted-foreground truncate', !c.name && 'invisible')}>
                  {c.name ?? ' '}
                </span>
                <select
                  value={currentRole(generatedSystem, c.id) ?? ''}
                  onChange={(e) => handleRoleChange(c.id, e.target.value as Role | '')}
                  disabled={!generatedSystem}
                  className="mt-1 w-full rounded border border-border bg-background text-[10px] text-muted-foreground disabled:opacity-40"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">—</option>
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run MainCanvas tests**

Run: `pnpm test --run MainCanvas`
Expected: all 7 tests pass

- [ ] **Step 5: Run full test suite**

Run: `pnpm test --run`
Expected: all tests pass

- [ ] **Step 6: Typecheck**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add components/editor/MainCanvas.tsx components/editor/__tests__/MainCanvas.test.tsx
git commit -m "feat: role assignment dropdown on color cards in MainCanvas"
```

---

## Task 6: Push to remote

- [ ] **Step 1: Push**

```bash
git push origin master
```

Expected: branch pushed to `https://github.com/MiguelPCO/Colorpalettefixer.git`
