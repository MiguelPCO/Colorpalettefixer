# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Next.js dev server
pnpm build        # Production build (runs tsc first)
pnpm typecheck    # tsc --noEmit (zero errors required)
pnpm lint         # Biome check
pnpm format       # Biome format --write
pnpm test         # Vitest (watch mode)
pnpm test:coverage  # Coverage — thresholds: 80% lines/fn/branches on lib/color/**
```

Run a single test file:
```bash
pnpm vitest run tests/unit/oklch/parse.test.ts
```

## Stack

- **Next.js 16** App Router + React 19 + TypeScript strict
- **Tailwind v4** (PostCSS build, no CDN)
- **Biome** for lint + format (not ESLint/Prettier)
- **Vitest** + jsdom + Testing Library (no Jest)
- **Zustand v5** + **zundo** (undo/redo) for state
- **culori** as canonical color conversion library
- **idb-keyval** for IndexedDB autosave
- **@dnd-kit** for drag-to-assign
- **shadcn/ui** (Radix primitives) for UI components

## TypeScript strict flags

`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `noFallthroughCasesInSwitch`. Array index access returns `T | undefined` — always guard.

## Architecture

### Color engine (`lib/color/`)

Pure functions, no React imports. All use **OKLCH as canonical space**.

| Module | Purpose |
|---|---|
| `types.ts` | All shared types: `Color`, `OKLCH`, `Finding`, `FindingType`, `Role`, `GeneratedSystem`, etc. |
| `oklch/parse.ts` | `parseToOklch(hex) → OKLCH \| null` — always check null |
| `oklch/format.ts` | `oklchToHex`, `oklchToRgb`, `isInSrgb` |
| `diagnostics/rules.ts` | 9 diagnostic rules (redundancy, neutral, accent, etc.) |
| `diagnostics/run.ts` | `runDiagnostics(colors) → Finding[]` — returns array directly, not `{ findings }` |
| `contrast/wcag.ts` | WCAG 2.2 contrast ratio |
| `contrast/apca.ts` | APCA Lc contrast |
| `contrast/classify.ts` | `classifyContrast()` → `ContrastReport` |
| `fix/` | `minDelta.ts`, `alternatives.ts` — fix suggestions for findings |
| `harmony/detect.ts` | Detects harmony template (mono/analogous/complementary/etc.) |
| `ramp/` | Generates 12-step light+dark ramps |
| `roles/` | Role assignment logic |
| `cvd/` | Color vision deficiency simulation |

### State (`lib/store/`)

Four Zustand stores — no cross-store imports, each is standalone:

| Store | Purpose | Persistence |
|---|---|---|
| `paletteStore.ts` | `colors`, `findings`, `generatedSystem`, `isAnalyzing` | idb-keyval via `autosave.ts` |
| `uiStore.ts` | `activeTab`, `selectedColorId`, `isPanelOpen`, `findingsFilter` | none |
| `favoritesStore.ts` | Saved palettes | localStorage `cpf-favorites-v1` |
| `sessionStore.ts` | `userId`, `isPro`, `paletteCount` | none |

Palette store uses `temporal()` (zundo) for 50-step undo/redo on `colors` only. Access temporal API: `usePaletteStore.temporal.getState().undo()`.

In tests, mock temporal with: `(usePaletteStore as any).temporal = { getState: () => ({ undo, redo }) }`.

### Editor UI (`components/editor/`)

3-column CSS grid layout via `EditorLayout.tsx` (280px | 1fr | 360px):
- **Sidebar**: color list + hex add input
- **MainCanvas**: color grid + Analyze button
- **Inspector**: Radix Tabs with 5 panels: Findings / Roles / Accessibility / Preview / Export

Wired in `app/editor/page.tsx` (client component). `useAutosave()` and `useEditorShortcuts()` are called at the page level.

### Keyboard shortcuts (`hooks/useEditorShortcuts.ts`)
- `Cmd/Ctrl+Z` → undo
- `Cmd/Ctrl+Shift+Z` → redo
- `Cmd/Ctrl+\` → toggle inspector panel

## Testing layout

```
tests/
  setup.ts              # @testing-library/jest-dom only
  unit/                 # mirrors lib/color/ structure
  golden/               # golden test fixtures (wcag-pairs.ts, apca-pairs.ts)
hooks/__tests__/        # hook tests
lib/color/*/            # some modules have __tests__/ inline
components/editor/__tests__/
```

Coverage is only measured on `lib/color/**`.

## Key invariants

- `parseToOklch` returns `OKLCH | null` — always null-check at call site.
- `runDiagnostics` returns `Finding[]` directly — not `{ findings }`.
- `Finding` required fields: `id`, `type: FindingType`, `severity`, `affectedColorIds`, `rule`, `ruleLabel`, `explanation`. No `colorIds` or `message` fields.
- `Color` required fields: `id`, `oklch`, `hex`, `rgb`, `inGamutSrgb`. Optional: `p3`, `alpha`, `name`, `locked`.
- Valid `Role` values: `primary | secondary | accent | neutral | background | surface | text | border | success | warning | error | info | disabled | focus`.
- `GeneratedSystem` optional fields `roles` and `contrastMatrix` were added in Plan 2; use `ContrastMatrixEntry` from `types.ts` for matrix values.

## AGENTS.md note

Next.js 16 has breaking changes vs training data. Before writing any Next.js-specific code, check `node_modules/next/dist/docs/`.
