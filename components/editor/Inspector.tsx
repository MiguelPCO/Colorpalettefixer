"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUIStore, type InspectorTab } from '@/lib/store/uiStore'
import { FindingsPanel } from './findings/FindingsPanel'
import { RolesTab } from './roles/RolesTab'
import { AccessibilityMatrix } from './accessibility/AccessibilityMatrix'
import { PreviewTab } from './preview/PreviewTab'
import { ExportPanel } from './export/ExportPanel'
import type { Color } from '@/lib/color/types'

interface InspectorProps {
  onFix: (colorId: string, patch: Partial<Color>) => void
}

const TABS: { value: InspectorTab; label: string }[] = [
  { value: 'findings', label: 'Issues' },
  { value: 'roles', label: 'Roles' },
  { value: 'accessibility', label: 'A11y' },
  { value: 'preview', label: 'Preview' },
  { value: 'export', label: 'Export' },
]

export function Inspector({ onFix }: InspectorProps) {
  const activeTab = useUIStore((s) => s.activeTab)
  const setActiveTab = useUIStore((s) => s.setActiveTab)

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as InspectorTab)}
      className="flex h-full flex-col"
    >
      <TabsList className="w-full shrink-0 rounded-none border-b border-border bg-transparent px-1 pt-1">
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value} className="text-xs">
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="flex-1 overflow-y-auto">
        <TabsContent value="findings" className="m-0 h-full">
          <FindingsPanel onFix={onFix} />
        </TabsContent>
        <TabsContent value="roles" className="m-0 h-full">
          <RolesTab />
        </TabsContent>
        <TabsContent value="accessibility" className="m-0 h-full">
          <AccessibilityMatrix />
        </TabsContent>
        <TabsContent value="preview" className="m-0 h-full">
          <PreviewTab />
        </TabsContent>
        <TabsContent value="export" className="m-0 h-full">
          <ExportPanel />
        </TabsContent>
      </div>
    </Tabs>
  )
}
