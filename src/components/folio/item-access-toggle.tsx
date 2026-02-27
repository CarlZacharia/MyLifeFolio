"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import type { Role, FolioItemWithAttachments } from "@/lib/types/app"
import { toast } from "sonner"

interface ItemAccessToggleProps {
  item: FolioItemWithAttachments
  allRoles: Role[]
  onToggleCustomAccess: (useCustom: boolean) => Promise<void>
  onSetItemRoles: (roleIds: string[]) => Promise<void>
}

export function ItemAccessToggle({
  item,
  allRoles,
  onToggleCustomAccess,
  onSetItemRoles,
}: ItemAccessToggleProps) {
  const [open, setOpen] = useState(false)
  const assignableRoles = allRoles.filter(
    (r) => r.role_type !== "no_restrictions" && r.role_type !== "owner_only"
  )
  const currentRoleIds = new Set(
    item.item_role_access?.map((a) => a.role_id) ?? []
  )

  const handleToggleCustom = async (checked: boolean) => {
    try {
      await onToggleCustomAccess(checked)
    } catch {
      toast.error("Failed to update access")
    }
  }

  const handleToggleRole = async (roleId: string, checked: boolean) => {
    const current = item.item_role_access?.map((a) => a.role_id) ?? []
    const newIds = checked
      ? [...current, roleId]
      : current.filter((id) => id !== roleId)
    try {
      await onSetItemRoles(newIds)
    } catch {
      toast.error("Failed to update access")
    }
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-3 text-sm hover:bg-muted/50">
        <div className="flex items-center gap-2">
          <Switch
            checked={item.use_custom_access}
            onCheckedChange={handleToggleCustom}
            onClick={(e) => e.stopPropagation()}
          />
          <span>Use custom access for this item</span>
        </div>
        {item.use_custom_access && (
          <ChevronDown
            className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </CollapsibleTrigger>

      {item.use_custom_access && (
        <CollapsibleContent className="mt-2 space-y-2 rounded-md border border-dashed p-3">
          <p className="text-xs text-muted-foreground">
            Select which roles can see this specific item:
          </p>
          {assignableRoles.map((role) => (
            <div key={role.id} className="flex items-center gap-2">
              <Checkbox
                checked={currentRoleIds.has(role.id)}
                onCheckedChange={(checked) =>
                  handleToggleRole(role.id, !!checked)
                }
              />
              <Label className="text-sm font-normal">{role.name}</Label>
            </div>
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}
