"use client"

import { useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuditLog } from "@/lib/hooks/use-audit-log"

export function useAccess() {
  const supabase = createClient()
  const { log } = useAuditLog()

  const setCategoryAccess = useCallback(
    async (categoryId: string, roleIds: string[]) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { error: new Error("Not authenticated") }

      // Remove existing access
      await supabase
        .from("category_role_access")
        .delete()
        .eq("category_id", categoryId)
        .eq("owner_id", user.id)

      // Insert new access
      if (roleIds.length > 0) {
        const { error } = await supabase.from("category_role_access").insert(
          roleIds.map((roleId) => ({
            category_id: categoryId,
            role_id: roleId,
            owner_id: user.id,
          }))
        )
        if (!error) {
          log({
            action: "access.update",
            resourceType: "category_access",
            resourceId: categoryId,
            details: { role_ids: roleIds },
          })
        }
        return { error }
      }

      log({
        action: "access.update",
        resourceType: "category_access",
        resourceId: categoryId,
        details: { role_ids: [] },
      })
      return { error: null }
    },
    [supabase, log]
  )

  const setItemAccess = useCallback(
    async (itemId: string, roleIds: string[]) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { error: new Error("Not authenticated") }

      // Remove existing access
      await supabase
        .from("item_role_access")
        .delete()
        .eq("item_id", itemId)
        .eq("owner_id", user.id)

      // Insert new access
      if (roleIds.length > 0) {
        const { error } = await supabase.from("item_role_access").insert(
          roleIds.map((roleId) => ({
            item_id: itemId,
            role_id: roleId,
            owner_id: user.id,
          }))
        )
        if (!error) {
          log({
            action: "access.update",
            resourceType: "item_access",
            resourceId: itemId,
            details: { role_ids: roleIds },
          })
        }
        return { error }
      }

      log({
        action: "access.update",
        resourceType: "item_access",
        resourceId: itemId,
        details: { role_ids: [] },
      })
      return { error: null }
    },
    [supabase, log]
  )

  return { setCategoryAccess, setItemAccess }
}
