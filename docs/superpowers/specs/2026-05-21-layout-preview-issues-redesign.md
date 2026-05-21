# Design Spec: Layout Resize + Preview Scenes + Issues Guidance

**Date:** 2026-05-21  
**Status:** Approved

## Overview

Three coordinated improvements to the CPF editor:

1. **Resizable right panel** — inspector width is drag-adjustable instead of fixed 360px
2. **Preview scenes** — Preview tab gains Landing / Dashboard / Mobile scenes alongside existing components
3. **Issues expandible** — FindingCards collapse by default; expand to show WCAG tip, reference, before/after swatches

---

## Section 1 — Layout: Resizable Inspector Panel

### Problem
`EditorLayout` uses `280px 1fr 360px`. Center has excess whitespace with few colors; inspector at 360px is tight for AccessibilityMatrix and Preview scenes.

### Design

`EditorLayout.tsx` replaces the fixed `360px` column with a drag handle between center and inspector.

**Drag handle:**
- 4px wide `<div>` between `<main>` and `<aside>` (inspector)
- `cursor: col-resize` always; highlights `primary` color on hover
- `mousedown` on handle → `mousemove` on `document` updates inspector width → `mouseup` releases

**Width constraints:**
- Default: 380px
- Min: 280px
- Max: 560px
- Clamped on every `mousemove` update

**Persistence:**
- `uiStore` gains `inspectorWidth: number` + `setInspectorWidth(w: number)`
- Persisted to localStorage. Verify during implementation whether `autosave.ts` already covers uiStore fields or if `inspectorWidth` needs explicit `localStorage.setItem` on change.

**Grid template:** switches from static string to computed `\`280px 1fr ${inspectorWidth}px\``

### Files
- `components/editor/EditorLayout.tsx` — drag logic, dynamic grid template
- `lib/store/uiStore.ts` — add `inspectorWidth` / `setInspectorWidth`

---

## Section 2 — Preview: Scenes + Components Tabs

### Problem
Current `PreviewTab` shows isolated components (buttons, badges, inputs) with no layout context. Hard to visualize how the palette feels in a real product.

### Design

`PreviewTab` gains a secondary tab bar: **Landing | Dashboard | Mobile | Components**.

**Components tab:** existing `SystemPreview` component, unchanged.

**Landing scene (`LandingScene`):**
- Nav bar: logo swatch + 3 nav links + CTA button (primary color)
- Hero: large heading, subtitle, two CTAs (primary filled + outline)
- Features grid: 3 cards with semantic color icons, title, description
- Simple footer with background color

**Dashboard scene (`DashboardScene`):**
- Left sidebar: nav links with active state (primary), icon placeholders
- Top bar: page title + avatar placeholder
- Stat cards (4): use success/warning/error/info semantic colors with subtle tinted backgrounds
- Data table: rows with status badges using semantic colors

**Mobile scene (`MobileScene`):**
- Phone frame (CSS border-radius device shell)
- Header with primary color + back arrow
- Content cards using surface/background/border roles
- Bottom tab bar: 4 tabs, active in primary color

**Shared rules:**
- All scenes use `generatedSystem.roles` — unavailable pre-analyze (same gate as today)
- Light/Dark toggle at top of PreviewTab applies to all scenes
- Each scene reads roles with fallbacks (same pattern as current `SystemPreview`)
- Scenes are read-only mockups — no interactivity beyond Light/Dark toggle

### Architecture

```
components/editor/preview/
  PreviewTab.tsx          ← adds sub-tab state + tab bar, orchestrates scenes
  SystemPreview.tsx       ← extracted from PreviewTab (Components tab content)
  scenes/
    LandingScene.tsx
    DashboardScene.tsx
    MobileScene.tsx
```

`PreviewTab.tsx` tracks `activeScene: 'landing' | 'dashboard' | 'mobile' | 'components'` in local state (not persisted — default `'landing'`).

### Files
- `components/editor/preview/PreviewTab.tsx` — add sub-tabs, extract SystemPreview
- `components/editor/preview/SystemPreview.tsx` — extracted from PreviewTab (no logic change)
- `components/editor/preview/scenes/LandingScene.tsx` — new
- `components/editor/preview/scenes/DashboardScene.tsx` — new
- `components/editor/preview/scenes/MobileScene.tsx` — new

---

## Section 3 — Issues: Expandible Cards with Guidance

### Problem
`FindingCard` shows rule name + explanation + Fix/Ignore. No actionable guidance on how to manually fix, no WCAG reference, no visual before/after for the suggested fix.

### Design

**Accordion behavior:**
- Cards collapsed by default — show only: severity icon + rule label + severity badge
- Click anywhere on the collapsed card → expands
- Only one card open at a time (accordion). `FindingsPanel` owns `openFindingId: string | null` state
- `FindingCard` receives `isOpen: boolean` + `onToggle: () => void` props

**Expanded content (in order):**
1. `finding.explanation` — existing text
2. **Tip block** (always): contextual how-to-fix text from `FINDING_TIPS[finding.type]`
3. **WCAG reference pill** (always): `finding.rule` as a link → WCAG URL from `FINDING_TIPS[finding.type].wcagUrl`
4. **Before/After swatches** (only if `finding.suggestion` exists): two color circles — current hex vs suggested fix hex, with hex labels
5. **Buttons**: Fix (if suggestion) + Ignore

**`lib/color/diagnostics/tips.ts`** — new file:
```ts
interface FindingTip {
  tip: string       // actionable guidance text
  wcagUrl: string   // canonical WCAG 2.2 anchor
}
export const FINDING_TIPS: Record<FindingType, FindingTip>
```

Coverage for all 10 `FindingType` values:
- `contrast-failure` → adjust L in OKLCH; reference SC 1.4.3
- `redundant` → merge or differentiate colors; reference SC 1.4.1
- `very-similar` → increase dL or dH between colors; reference SC 1.4.1
- `outlier` → harmonize hue to palette range; heuristic
- `no-neutral` → add low-chroma color (C < 0.02) for text hierarchy; heuristic
- `no-accent` → add complementary hue for interactive states; heuristic
- `no-hierarchy` → ensure ≥3 distinct lightness levels; heuristic
- `double-accent` → consolidate to one accent role; heuristic
- `ramp-gap` → fill missing lightness step in ramp; heuristic
- `temperature-imbalance` → balance warm/cool hues in palette; heuristic

WCAG findings link to `https://www.w3.org/TR/WCAG22/#<anchor>`. Heuristic findings link to general `https://www.w3.org/TR/WCAG22/`.

### Files
- `lib/color/diagnostics/tips.ts` — new, `FINDING_TIPS` map
- `components/editor/findings/FindingCard.tsx` — accordion UI, expanded content, before/after swatches
- `components/editor/findings/FindingsPanel.tsx` — `openFindingId` state, pass `isOpen`/`onToggle` to cards

---

## Testing

- `EditorLayout`: resize drag updates grid column width; clamps to min/max; persists to uiStore
- `PreviewTab`: sub-tabs render correct scene; Light/Dark toggle applies
- Scene components: render without crash with minimal roles; fallbacks work when roles missing
- `FindingCard`: collapsed by default; click expands; second card click collapses first; Fix/Ignore still callable when expanded
- `tips.ts`: all 10 FindingTypes covered (no undefined key)

---

## Out of Scope

- Animated transitions on drag handle or accordion
- Persisting active Preview scene across sessions
- Scene interactivity (hover states, click handlers inside mockups)
- Mobile responsiveness of the editor shell itself
