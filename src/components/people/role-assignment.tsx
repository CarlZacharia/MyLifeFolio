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
import type { Role, PersonWithRoles } from "@/lib/types/app"

interface RoleAssignmentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  person: PersonWithRoles
  allRoles: Role[]
  onToggleRole: (roleId: string, assigned: boolean) => void
}

export function RoleAssignment({
  open,
  onOpenChange,
  person,
  allRoles,
  onToggleRole,
}: RoleAssignmentProps) {
  const assignedRoleIds = new Set(
    person.person_roles?.map((pr) => pr.role_id) ?? []
  )

  // Filter out 'no_restrictions' and 'owner_only' roles — those are category-level only
  const assignableRoles = allRoles.filter(
    (r) => r.role_type !== "no_restrictions" && r.role_type !== "owner_only"
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Manage Roles for {person.full_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {assignableRoles.map((role) => {
            const isAssigned = assignedRoleIds.has(role.id)
            return (
              <div key={role.id} className="flex items-start gap-3">
                <Checkbox
                  id={`role-${role.id}`}
                  checked={isAssigned}
                  onCheckedChange={(checked) =>
                    onToggleRole(role.id, !!checked)
                  }
                />
                <div>
                  <Label htmlFor={`role-${role.id}`} className="font-medium">
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
