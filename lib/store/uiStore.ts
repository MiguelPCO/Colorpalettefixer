import { create } from 'zustand'

export type InspectorTab = 'findings' | 'roles' | 'accessibility' | 'preview' | 'export'
export type FindingsFilter = 'all' | 'critical' | 'warning' | 'info'

interface UIState {
  activeTab: InspectorTab
  selectedColorId: string | null
  isPanelOpen: boolean
  findingsFilter: FindingsFilter
}

interface UIActions {
  setActiveTab: (tab: InspectorTab) => void
  selectColor: (id: string | null) => void
  togglePanel: () => void
  setFindingsFilter: (f: FindingsFilter) => void
  reset: () => void
}

const INITIAL: UIState = {
  activeTab: 'findings',
  selectedColorId: null,
  isPanelOpen: true,
  findingsFilter: 'all',
}

export const useUIStore = create<UIState & UIActions>()((set) => ({
  ...INITIAL,
  setActiveTab: (activeTab) => set({ activeTab }),
  selectColor: (selectedColorId) => set({ selectedColorId }),
  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
  setFindingsFilter: (findingsFilter) => set({ findingsFilter }),
  reset: () => set(INITIAL),
}))
