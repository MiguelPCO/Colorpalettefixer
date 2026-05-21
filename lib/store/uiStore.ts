import { create } from 'zustand'

export type InspectorTab = 'findings' | 'roles' | 'accessibility' | 'preview' | 'export'
export type FindingsFilter = 'all' | 'critical' | 'warning' | 'info'
export type ContrastMode = 'WCAG' | 'APCA'
export type MatrixTier = 'AA' | 'AAA'
export type CvdMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'
export type PreviewMode = 'light' | 'dark'
export type MatrixFontSize = 'normal' | 'large'
export type MatrixWeight = 'normal' | 'bold'

interface UIState {
  activeTab: InspectorTab
  selectedColorId: string | null
  isPanelOpen: boolean
  findingsFilter: FindingsFilter
  contrastMode: ContrastMode
  matrixTier: MatrixTier
  cvdMode: CvdMode
  previewMode: PreviewMode
  matrixFontSize: MatrixFontSize
  matrixWeight: MatrixWeight
  inspectorWidth: number
}

interface UIActions {
  setActiveTab: (tab: InspectorTab) => void
  selectColor: (id: string | null) => void
  togglePanel: () => void
  setFindingsFilter: (f: FindingsFilter) => void
  setContrastMode: (mode: ContrastMode) => void
  setMatrixTier: (tier: MatrixTier) => void
  setCvdMode: (mode: CvdMode) => void
  setPreviewMode: (mode: PreviewMode) => void
  setMatrixFontSize: (size: MatrixFontSize) => void
  setMatrixWeight: (weight: MatrixWeight) => void
  setInspectorWidth: (w: number) => void
  reset: () => void
}

function getInitialInspectorWidth(): number {
  if (typeof window === 'undefined') return 380
  return Number(localStorage.getItem('cpf-inspector-width')) || 380
}

const INITIAL: UIState = {
  activeTab: 'findings',
  selectedColorId: null,
  isPanelOpen: true,
  findingsFilter: 'all',
  contrastMode: 'WCAG',
  matrixTier: 'AA',
  cvdMode: 'none',
  previewMode: 'light',
  matrixFontSize: 'normal',
  matrixWeight: 'normal',
  inspectorWidth: 380,
}

export const useUIStore = create<UIState & UIActions>()((set) => ({
  ...INITIAL,
  inspectorWidth: getInitialInspectorWidth(),
  setActiveTab: (activeTab) => set({ activeTab }),
  selectColor: (selectedColorId) => set({ selectedColorId }),
  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
  setFindingsFilter: (findingsFilter) => set({ findingsFilter }),
  setContrastMode: (contrastMode) => set({ contrastMode }),
  setMatrixTier: (matrixTier) => set({ matrixTier }),
  setCvdMode: (cvdMode) => set({ cvdMode }),
  setPreviewMode: (previewMode) => set({ previewMode }),
  setMatrixFontSize: (matrixFontSize) => set({ matrixFontSize }),
  setMatrixWeight: (matrixWeight) => set({ matrixWeight }),
  setInspectorWidth: (w) => {
    set({ inspectorWidth: w })
    if (typeof window !== 'undefined') {
      localStorage.setItem('cpf-inspector-width', String(w))
    }
  },
  reset: () => set((s) => ({ ...INITIAL, inspectorWidth: s.inspectorWidth })),
}))
