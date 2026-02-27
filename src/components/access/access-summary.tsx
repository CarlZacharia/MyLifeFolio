"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CategoryWithAccess, PersonWithRoles } from "@/lib/types/app"

interface AccessSummaryProps {
  categories: CategoryWithAccess[]
  persons: PersonWithRoles[]
}

export function AccessSummary({ categories, persons }: AccessSummaryProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Who can see what</h3>
      {persons.map((person) => {
        const personRoleIds = new Set(
          person.person_roles?.map((pr) => pr.role_id) ?? []
        )

        const accessibleCategories = categories.filter((cat) => {
          const catRoles = cat.category_role_access ?? []
          // No Restrictions → everyone
          if (catRoles.some((a) => a.role?.role_type === "no_restrictions"))
            return true
          // Owner Only → no one
          if (catRoles.some((a) => a.role?.role_type === "owner_only"))
            return false
          // Check role overlap
          return catRoles.some((a) => personRoleIds.has(a.role_id))
        })

        return (
          <Card key={person.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {person.full_name}
                {person.emergency_override && (
                  <Badge variant="outline" className="ml-2 text-[10px] text-warning">
                    Full Access
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {person.relationship || person.email}
              </p>
            </CardHeader>
            <CardContent>
              {person.emergency_override ? (
                <p className="text-xs text-muted-foreground">
                  Has emergency override — can access all categories
                </p>
              ) : accessibleCategories.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No categories accessible (assign roles to grant access)
                </p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {accessibleCategories.map((cat) => (
                    <Badge
                      key={cat.id}
                      variant="secondary"
                      className="text-[10px]"
                    >
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
