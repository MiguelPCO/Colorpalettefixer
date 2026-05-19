'use client'
import { useCallback } from 'react'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { usePaletteStore } from '@/lib/store/paletteStore'
import { ALL_ROLES } from '@/lib/color/roles/constants'
import { RoleSlot } from './RoleSlot'
import type { Role } from '@/lib/color/types'

export function RolesTab() {
  const generatedSystem = usePaletteStore((s) => s.generatedSystem)
  const setGeneratedSystem = usePaletteStore((s) => s.setGeneratedSystem)

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || !generatedSystem) return
      const colorId = active.id as string
      const role = over.id as Role
      const colors = usePaletteStore.getState().colors
      const color = colors.find((c) => c.id === colorId)
      if (!color) return
      setGeneratedSystem({
        ...generatedSystem,
        roles: { ...generatedSystem.roles, [role]: color },
      })
    },
    [generatedSystem, setGeneratedSystem],
  )

  if (!generatedSystem) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-center text-sm text-muted-foreground">
          Run <strong>Analyze</strong> to see role assignments
        </p>
      </div>
    )
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="space-y-1.5 p-3">
        <p className="text-xs text-muted-foreground mb-3">
          Drag palette colors onto role slots to override assignments
        </p>
        {ALL_ROLES.map((role) => (
          <RoleSlot
            key={role}
            role={role}
            assignedColor={generatedSystem.roles?.[role] ?? null}
          />
        ))}
      </div>
    </DndContext>
  )
}
