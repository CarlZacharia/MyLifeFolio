"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Role, CategoryWithAccess } from "@/lib/types/app"

interface AccessMatrixProps {
  categories: CategoryWithAccess[]
  roles: Role[]
  onToggle: (categoryId: string, roleId: string, currentlyGranted: boolean) => void
}

export function AccessMatrix({ categories, roles, onToggle }: AccessMatrixProps) {
  const displayRoles = roles.filter((r) => r.role_type !== "owner_only")

  return (
    <ScrollArea className="w-full">
      <div className="min-w-[800px]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="sticky left-0 bg-background px-3 py-2 text-left font-medium">
                Category
              </th>
              {displayRoles.map((role) => (
                <th key={role.id} className="px-2 py-2 text-center font-medium">
                  <div className="max-w-20 truncate text-xs">{role.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const grantedIds = new Set(
                category.category_role_access?.map((a) => a.role_id) ?? []
              )
              return (
                <tr key={category.id} className="border-b hover:bg-muted/50">
                  <td className="sticky left-0 bg-background px-3 py-2 font-medium">
                    {category.name}
                  </td>
                  {displayRoles.map((role) => {
                    const isGranted = grantedIds.has(role.id)
                    return (
                      <td key={role.id} className="px-2 py-2 text-center">
                        <Checkbox
                          checked={isGranted}
                          onCheckedChange={() =>
                            onToggle(category.id, role.id, isGranted)
                          }
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  )
}
