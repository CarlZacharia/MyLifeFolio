"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Role, CategoryWithAccess } from "@/lib/types/app"

interface CategoryAccessEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: CategoryWithAccess
  allRoles: Role[]
  onToggleRole: (roleId: string, granted: boolean) => void
}

export function CategoryAccessEditor({
  open,
  onOpenChange,
  category,
  allRoles,
  onToggleRole,
}: CategoryAccessEditorProps) {
  const grantedRoleIds = new Set(
    category.category_role_access?.map((a) => a.role_id) ?? []
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Access: {category.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Select which roles can view items in this category:
          </p>
          {allRoles.map((role) => {
            const isGranted = grantedRoleIds.has(role.id)
            return (
              <div key={role.id} className="flex items-start gap-3">
                <Checkbox
                  id={`cat-access-${role.id}`}
                  checked={isGranted}
                  onCheckedChange={(checked) =>
                    onToggleRole(role.id, !!checked)
                  }
                />
                <div>
                  <Label
                    htmlFor={`cat-access-${role.id}`}
                    className="font-medium"
                  >
                    {role.name}
                  </Label>
                  {role.description && (
                    <p className="text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
