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
  reset: () => void
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
}

export const useUIStore = create<UIState & UIActions>()((set) => ({
  ...INITIAL,
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
  reset: () => set(INITIAL),
}))
