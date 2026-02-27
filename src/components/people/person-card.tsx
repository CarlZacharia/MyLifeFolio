"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2, AlertTriangle, Mail, Shield } from "lucide-react"
import { RoleBadge } from "./role-badge"
import type { PersonWithRoles } from "@/lib/types/app"

interface PersonCardProps {
  person: PersonWithRoles
  onEdit: () => void
  onDelete: () => void
  onManageRoles: () => void
  onInvite?: () => void
}

export function PersonCard({
  person,
  onEdit,
  onDelete,
  onManageRoles,
  onInvite,
}: PersonCardProps) {
  const roles = person.person_roles?.map((pr) => pr.role) ?? []

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {person.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{person.full_name}</h4>
                {person.emergency_override && (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-warning"
                  >
                    <AlertTriangle className="mr-0.5 size-2.5" />
                    Emergency Override
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {person.relationship || person.email}
              </p>
              {roles.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {roles.map((role) => (
                    <RoleBadge
                      key={role.id}
                      name={role.name}
                      roleType={role.role_type}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 size-4" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onManageRoles}>
                <Shield className="mr-2 size-4" />
                Manage Roles
              </DropdownMenuItem>
              {onInvite && !person.has_user_account && (
                <DropdownMenuItem onClick={onInvite}>
                  <Mail className="mr-2 size-4" />
                  Send Invitation
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 size-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
