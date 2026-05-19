# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

Tradeoff: These guidelines bias toward caution over speed. For trivial tasks, use judgment.

1. Think Before Coding
   Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

State your assumptions explicitly. If uncertain, ask.
If multiple interpretations exist, present them - don't pick silently.
If a simpler approach exists, say so. Push back when warranted.
If something is unclear, stop. Name what's confusing. Ask. 2. Simplicity First
Minimum code that solves the problem. Nothing speculative.

No features beyond what was asked.
No abstractions for single-use code.
No "flexibility" or "configurability" that wasn't requested.
No error handling for impossible scenarios.
If you write 200 lines and it could be 50, rewrite it.
Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

3. Surgical Changes
   Touch only what you must. Clean up only your own mess.

When editing existing code:

Don't "improve" adjacent code, comments, or formatting.
Don't refactor things that aren't broken.
Match existing style, even if you'd do it differently.
If you notice unrelated dead code, mention it - don't delete it.
When your changes create orphans:

Remove imports/variables/functions that YOUR changes made unused.
Don't remove pre-existing dead code unless asked.
The test: Every changed line should trace directly to the user's request.

4. Goal-Driven Execution
   Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

"Add validation" → "Write tests for invalid inputs, then make them pass"
"Fix the bug" → "Write a test that reproduces it, then make it pass"
"Refactor X" → "Ensure tests pass before and after"
For multi-step tasks, state a brief plan:

1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
   Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

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

| Module                 | Purpose                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `types.ts`             | All shared types: `Color`, `OKLCH`, `Finding`, `FindingType`, `Role`, `GeneratedSystem`, etc. |
| `oklch/parse.ts`       | `parseToOklch(hex) → OKLCH \| null` — always check null                                       |
| `oklch/format.ts`      | `oklchToHex`, `oklchToRgb`, `isInSrgb`                                                        |
| `diagnostics/rules.ts` | 9 diagnostic rules (redundancy, neutral, accent, etc.)                                        |
| `diagnostics/run.ts`   | `runDiagnostics(colors) → Finding[]` — returns array directly, not `{ findings }`             |
| `contrast/wcag.ts`     | WCAG 2.2 contrast ratio                                                                       |
| `contrast/apca.ts`     | APCA Lc contrast                                                                              |
| `contrast/classify.ts` | `classifyContrast()` → `ContrastReport`                                                       |
| `fix/`                 | `minDelta.ts`, `alternatives.ts` — fix suggestions for findings                               |
| `harmony/detect.ts`    | Detects harmony template (mono/analogous/complementary/etc.)                                  |
| `ramp/`                | Generates 12-step light+dark ramps                                                            |
| `roles/`               | Role assignment logic                                                                         |
| `cvd/`                 | Color vision deficiency simulation                                                            |

### State (`lib/store/`)

Four Zustand stores — no cross-store imports, each is standalone:

| Store               | Purpose                                                                                                                                                   | Persistence                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `paletteStore.ts`   | `colors`, `findings`, `generatedSystem`, `isAnalyzing`                                                                                                    | idb-keyval via `autosave.ts`    |
| `uiStore.ts`        | `activeTab`, `selectedColorId`, `isPanelOpen`, `findingsFilter`, `contrastMode`, `matrixTier`, `cvdMode`, `previewMode`, `matrixFontSize`, `matrixWeight` | none                            |
| `favoritesStore.ts` | Saved palettes                                                                                                                                            | localStorage `cpf-favorites-v1` |
| `sessionStore.ts`   | `userId`, `isPro`, `paletteCount`                                                                                                                         | none                            |

Palette store uses `temporal()` (zundo) for 50-step undo/redo on `colors` only. Access temporal API: `usePaletteStore.temporal.getState().undo()`.

`batchUpdateColors(patches: {id, patch}[])` does a single `set()` so all changes land as one undo entry.

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
- `F9` → encode palette as LZString hash, write to URL fragment + clipboard

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
- `GeneratedSystem` optional fields `roles` and `contrastMatrix` — use `ContrastMatrixEntry` from `types.ts` for matrix values.
- `checkContrastFailure` fires on WCAG < 4.5:1 **and/or** APCA |Lc| < 60 for pairs with `lDiff > 0.20`.
- `checkOutlier` uses circular MAD centroid (chromatic colors only, c > 0.1); threshold = `max(median + 3·MAD, 45°)`.
- `generateCss` / `generateTailwind` accept optional `prefix` (default `'--color-'`).
- Share URL: `lib/share.ts` encodes `{l,c,h,n?}[]` with LZString. Editor page decodes hash after `useAutosave()`, resets store, loads colors, then strips hash.
- `AccessibilityMatrix` `matrixFontSize='large'` re-classifies WCAG levels for large text: `AA_LARGE→AA`, `AA→AAA`.

## AGENTS.md note

Next.js 16 has breaking changes vs training data. Before writing any Next.js-specific code, check `node_modules/next/dist/docs/`.
