"use client"

import { useCategories } from "@/lib/hooks/use-categories"
import { useRoles } from "@/lib/hooks/use-roles"
import { useAccess } from "@/lib/hooks/use-access"
import { Header } from "@/components/layout/header"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

export default function AccessPage() {
  const { categories, loading: catsLoading, refetch } = useCategories()
  const { roles, loading: rolesLoading } = useRoles()
  const { setCategoryAccess } = useAccess()

  const loading = catsLoading || rolesLoading

  // Filter roles for the matrix — exclude owner_only (it's a special marker)
  const displayRoles = roles.filter((r) => r.role_type !== "owner_only")

  const handleToggle = async (
    categoryId: string,
    roleId: string,
    currentlyGranted: boolean
  ) => {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    const currentRoleIds =
      category.category_role_access?.map((a) => a.role_id) ?? []

    let newRoleIds: string[]
    if (currentlyGranted) {
      newRoleIds = currentRoleIds.filter((id) => id !== roleId)
    } else {
      newRoleIds = [...currentRoleIds, roleId]
    }

    const { error } = await setCategoryAccess(categoryId, newRoleIds)
    if (error) {
      toast.error("Failed to update access")
    } else {
      await refetch()
    }
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Access Control" },
        ]}
      />
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary">
              Access Control Matrix
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Control which roles can see each category. Click any cell to toggle
              access.
            </p>
          </div>

          {loading ? (
            <Skeleton className="h-96 w-full rounded-lg" />
          ) : (
            <ScrollArea className="w-full">
              <div className="min-w-[800px]">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="sticky left-0 bg-background px-3 py-2 text-left font-medium">
                        Category
                      </th>
                      {displayRoles.map((role) => (
                        <th
                          key={role.id}
                          className="px-2 py-2 text-center font-medium"
                        >
                          <div className="max-w-20 truncate text-xs">
                            {role.name}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => {
                      const grantedIds = new Set(
                        category.category_role_access?.map((a) => a.role_id) ??
                          []
                      )
                      return (
                        <tr key={category.id} className="border-b hover:bg-muted/50">
                          <td className="sticky left-0 bg-background px-3 py-2 font-medium">
                            {category.name}
                          </td>
                          {displayRoles.map((role) => {
                            const isGranted = grantedIds.has(role.id)
                            return (
                              <td
                                key={role.id}
                                className="px-2 py-2 text-center"
                              >
                                <Checkbox
                                  checked={isGranted}
                                  onCheckedChange={() =>
                                    handleToggle(
                                      category.id,
                                      role.id,
                                      isGranted
                                    )
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
          )}
        </div>
      </div>
    </>
  )
}
