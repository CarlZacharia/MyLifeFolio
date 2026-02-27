"use client"

import { useCallback } from "react"
import { useSupabase } from "@/lib/supabase/use-supabase"
import type { AuditAction } from "@/lib/types/app"

export function useAuditLog() {
  const supabase = useSupabase()

  const log = useCallback(
    async (params: {
      action: AuditAction
      resourceType: string
      resourceId?: string
      details?: Record<string, unknown>
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from("audit_log").insert({
        owner_id: user.id,
        actor_id: user.id,
        action: params.action,
        resource_type: params.resourceType,
        resource_id: params.resourceId || null,
        details: params.details || {},
      })
    },
    [supabase]
  )

  return { log }
}
