import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import type { Color, Role } from '@/lib/color/types'

interface RoleSlotProps {
  role: Role
  assignedColor: Color | null | undefined
  onUnassign?: (role: Role) => void
}

export function RoleSlot({ role, assignedColor, onUnassign }: RoleSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id: role })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex items-center gap-3 rounded-md border border-dashed border-border p-2 transition-colors',
        isOver && 'border-primary bg-primary/5',
      )}
    >
      <div className="w-24 shrink-0">
        <span className="text-xs font-medium capitalize">{role.replace(/-/g, ' ')}</span>
      </div>
      {assignedColor ? (
        <div className="flex flex-1 items-center gap-2">
          <span
            className="h-5 w-5 rounded border border-black/10 shrink-0"
            style={{ backgroundColor: assignedColor.hex }}
            aria-hidden
          />
          <span className="font-mono text-xs">{assignedColor.hex}</span>
          {onUnassign && (
            <button
              onClick={() => onUnassign(role)}
              className="ml-auto text-xs text-muted-foreground hover:text-destructive"
              aria-label={`Unassign ${role}`}
            >
              ×
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 text-xs text-muted-foreground italic">Drop color here</div>
      )}
    </div>
  )
}
