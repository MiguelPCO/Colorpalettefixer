"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUIStore, type InspectorTab } from '@/lib/store/uiStore'
import { FindingsPanel } from './findings/FindingsPanel'

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <p className="text-sm text-muted-foreground">{label} (coming soon)</p>
    </div>
  )
}

const TABS: { value: InspectorTab; label: string }[] = [
  { value: 'findings', label: 'Issues' },
  { value: 'roles', label: 'Roles' },
  { value: 'accessibility', label: 'A11y' },
  { value: 'preview', label: 'Preview' },
  { value: 'export', label: 'Export' },
]

export function Inspector() {
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
          <FindingsPanel />
        </TabsContent>
        <TabsContent value="roles" className="m-0 h-full">
          <Placeholder label="Roles" />
        </TabsContent>
        <TabsContent value="accessibility" className="m-0 h-full">
          <Placeholder label="Accessibility" />
        </TabsContent>
        <TabsContent value="preview" className="m-0 h-full">
          <Placeholder label="Preview" />
        </TabsContent>
        <TabsContent value="export" className="m-0 h-full">
          <Placeholder label="Export" />
        </TabsContent>
      </div>
    </Tabs>
  )
}
