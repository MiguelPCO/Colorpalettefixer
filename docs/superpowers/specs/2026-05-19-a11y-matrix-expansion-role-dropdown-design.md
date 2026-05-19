# Design: A11y Matrix Expansion + Role Dropdown on Color Cards

**Date:** 2026-05-19  
**Status:** Approved

---

## Overview

Two related features:
1. **A11y matrix expansion** — expand contrast matrix from 3 FG × 2 BG roles to 12 FG × 5 BG roles, add role labels to headers
2. **Role dropdown on color cards** — inline role assignment `<select>` on each MainCanvas color card

---

## Feature 1: A11y Matrix Expansion

### Problem

Current matrix covers only `[text, neutral, disabled]` × `[background, surface]` — 6 cells max. Real-world palette needs contrast checks for primary, secondary, accent, semantic colors (error/warning/success/info), focus, and border roles.

Additionally, `TEXT_ROLES` / `BG_ROLES` arrays are duplicated between `app/editor/page.tsx` (matrix builder) and `components/editor/accessibility/AccessibilityMatrix.tsx` (renderer).

### Solution

**New file: `lib/color/roles/constants.ts`**

```typescript
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

`RolesTab.tsx` also defines `ALL_ROLES` locally — it should import from here instead.

Both files import from this single source. Eliminates duplication.

**`app/editor/page.tsx`**
- Remove local `TEXT_ROLES` / `BG_ROLES` declarations
- Import `MATRIX_FG_ROLES` / `MATRIX_BG_ROLES` from constants
- Use them in the `contrastMatrix` build loop (no other changes)

**`components/editor/accessibility/AccessibilityMatrix.tsx`**
- Remove local `TEXT_ROLES` / `BG_ROLES` declarations
- Import `MATRIX_FG_ROLES` / `MATRIX_BG_ROLES` from constants
- Column headers: show role name + hex swatch (role name above, hex below)
- Row headers: show role name + hex swatch
- Add legend below matrix: `* border and focus roles checked at 3:1 (non-text contrast)`
- Empty cells (unassigned roles): already handled by Map deduplication — renders `—`

### Thresholds

`ContrastCell` already renders `AA_LARGE` (≥ 3:1) as a distinct level. No changes needed — `border` and `focus` rows will naturally show `AA_LARGE` as passing threshold for non-text UI components.

### Scope

- No new store fields
- No new controls or UI toggles
- No changes to `ContrastCell`
- Matrix may have many `—` cells if palette has few colors assigned to roles — this is expected and correct

---

## Feature 2: Role Dropdown on MainCanvas Color Cards

### Problem

Role assignment requires navigating to the Roles tab and using drag-and-drop. Users want to assign roles directly from the color grid they're looking at.

### Solution

**`components/editor/MainCanvas.tsx`**

**Structural change:** Card outer element changes from `<button>` to `<div>` (a `<select>` inside a `<button>` is invalid HTML). The color swatch area gets its own `onClick` for selection.

**New card structure:**
```tsx
<div key={c.id} className={cn('flex flex-col overflow-hidden rounded-lg border border-black/10 transition-shadow cursor-pointer', ...)}>
  {/* Clickable swatch */}
  <span
    className="block h-20 w-full"
    style={{ backgroundColor: c.hex }}
    onClick={() => selectColor(c.id === selectedColorId ? null : c.id)}
  />
  {/* Info area — not part of selection click */}
  <div className="bg-background px-2 py-1.5" onClick={e => e.stopPropagation()}>
    <span className="block font-mono text-xs">{c.hex}</span>
    <span className={cn('block text-xs text-muted-foreground truncate', !c.name && 'invisible')}>
      {c.name ?? ' '}
    </span>
    <select
      value={currentRole(generatedSystem, c.id) ?? ''}
      onChange={e => handleRoleChange(c.id, e.target.value as Role | '')}
      disabled={!generatedSystem}
      className="mt-1 w-full rounded border border-border bg-background text-[10px] text-muted-foreground"
      onClick={e => e.stopPropagation()}
    >
      <option value="">—</option>
      {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
    </select>
  </div>
</div>
```

**Helpers (inline in component):**

```typescript
function currentRole(system: GeneratedSystem | null, colorId: string): Role | null {
  if (!system?.roles) return null
  for (const [role, color] of Object.entries(system.roles)) {
    if (color?.id === colorId) return role as Role
  }
  return null
}

function handleRoleChange(colorId: string, newRole: Role | '') {
  if (!generatedSystem) return
  const color = colors.find(c => c.id === colorId)!
  const updatedRoles = { ...generatedSystem.roles }
  // Unassign color from any current role
  for (const r of Object.keys(updatedRoles) as Role[]) {
    if (updatedRoles[r]?.id === colorId) delete updatedRoles[r]
  }
  if (newRole) updatedRoles[newRole] = color
  setGeneratedSystem({ ...generatedSystem, roles: updatedRoles })
}
```

**State requirements:**
- `generatedSystem` (read) — `usePaletteStore(s => s.generatedSystem)`
- `setGeneratedSystem` (write) — `usePaletteStore(s => s.setGeneratedSystem)`
- `ALL_ROLES` constant — import from `lib/color/roles/constants.ts`

**Before Analyze:** `select` is `disabled`, shows `—`. No tooltip needed — consistent with RolesTab behavior.

**Card height:** Adding the select row increases card height by ~24px uniformly across all cards — no inconsistency since every card has the row.

---

## Files to Create

| File | Action |
|------|--------|
| `lib/color/roles/constants.ts` | Create — shared role arrays (`ALL_ROLES`, `MATRIX_FG_ROLES`, `MATRIX_BG_ROLES`) |

## Files to Modify

| File | Changes |
|------|---------|
| `app/editor/page.tsx` | Remove local role arrays, import from constants |
| `components/editor/accessibility/AccessibilityMatrix.tsx` | Import from constants, add role labels to headers, add legend |
| `components/editor/MainCanvas.tsx` | Add role select, restructure card from `<button>` to `<div>` |
| `components/editor/roles/RolesTab.tsx` | Remove local `ALL_ROLES`, import from constants |

---

## Out of Scope

- Syncing role changes back to the diagnostics pipeline (re-running diagnostics after role override is a separate feature)
- RolesTab drag-and-drop remains as-is (both UIs write to same `generatedSystem.roles`)
- No new tests in this scope (existing AccessibilityMatrix and MainCanvas tests updated as needed)
