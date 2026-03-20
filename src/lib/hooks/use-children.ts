"use client"

import { useEffect, useState, useCallback } from "react"
import { useSupabase } from "@/lib/supabase/use-supabase"
import { useAuditLog } from "@/lib/hooks/use-audit-log"
import type { Child } from "@/lib/types/app"

export function useChildren() {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useSupabase()
  const { log } = useAuditLog()

  const fetchChildren = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from("children")
      .select("*")
      .eq("owner_id", user.id)
      .order("sort_order", { ascending: true })

    if (data) {
      setChildren(data as Child[])
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchChildren()
  }, [fetchChildren])

  const createChild = async (child: {
    full_name: string
    date_of_birth?: string | null
    gender?: string | null
    phone?: string | null
    email?: string | null
    notes?: string | null
    parent_relationship?: string
  }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: new Error("Not authenticated") }

    const { data, error } = await supabase
      .from("children")
      .insert({
        ...child,
        owner_id: user.id,
        sort_order: children.length,
      })
      .select()
      .single()

    if (data) {
      await fetchChildren()
      log({
        action: "child.create",
        resourceType: "child",
        resourceId: data.id,
        details: { full_name: child.full_name },
      })
    }
    return { data, error }
  }

  const updateChild = async (
    id: string,
    updates: {
      full_name?: string
      date_of_birth?: string | null
      gender?: string | null
      phone?: string | null
      email?: string | null
      notes?: string | null
      parent_relationship?: string
    }
  ) => {
    const { data, error } = await supabase
      .from("children")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (data) {
      await fetchChildren()
      log({
        action: "child.update",
        resourceType: "child",
        resourceId: id,
        details: { updated_fields: Object.keys(updates) },
      })
    }
    return { data, error }
  }

  const deleteChild = async (id: string) => {
    const { error } = await supabase.from("children").delete().eq("id", id)
    if (!error) {
      await fetchChildren()
      log({
        action: "child.delete",
        resourceType: "child",
        resourceId: id,
      })
    }
    return { error }
  }

  return { children, loading, createChild, updateChild, deleteChild, refetch: fetchChildren }
}
